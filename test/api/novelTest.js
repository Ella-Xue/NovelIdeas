const chai = require("chai")
const expect = chai.expect
const request = require("supertest")
const MongoMemoryServer = require("mongodb-memory-server").MongoMemoryServer
const Novel = require("../../models/novels")
const User = require("../../models/user")
const Author = require("../../models/author")
const mongoose = require("mongoose")
mongoose.set("useFindAndModify", false)
const _ = require("lodash")

let server
let mongod
let db, validID,validID1,validID2

describe("Novel-Ideas", () => {
    before(async () => {
        try {
            mongod = new MongoMemoryServer({
                instance: {
                    port: 27017,
                    dbPath: "./test/database",
                    dbName: "novels"
                }
            })
            await mongod.getConnectionString()

            mongoose.connect("mongodb://localhost:27017/novels", {
                useNewUrlParser: true,
                useUnifiedTopology: true
            })
            server = require("../../bin/www")
            db = mongoose.connection
        } catch (error) {
            console.log(error)
        }
    })

    after(async () => {
        try {
            await mongoose.connection.db.dropDatabase()
        } catch (error) {
            console.log(error)
        }
    })

    beforeEach(async () => {
        try {
            await Novel.deleteMany({})
            let novel = new Novel()
            novel.name = "Rusty Hotel"
            novel.author = "Rusty"
            novel.type = "Horror"
            novel.recommender = "Merry"
            novel.grade = 5
            await novel.save()
            novel = new Novel()
            novel.name = "Cube Escape"
            novel.author = "Rusty"
            novel.type = "Horror"
            novel.recommender = "Merry"
            novel.grade = 3
            await novel.save()
            novel = await Novel.findOne({name: "Rusty Hotel"})
            validID = novel._id

            await User.deleteMany({})
            let user = new User()
            user.username = "Merry"
            user.password = "123456"
            user.email = "merry@ie"
            await user.save()
            user = new User()
            user.username = "Lily"
            user.password = "123456"
            user.email = "lily@ie"
            await user.save()
            user = await User.findOne({username: "Merry"})
            validID1 = user._id

            await Author.deleteMany({})
            let author = new Author()
            author.name = "Rusty"
            author.keyword1 = "Horror"
            author.keyword2 = "Science Fiction"
            author.numofbooks = 4
            author.numofcollected = 9
            await author.save()
            author = new Author()
            author.name = "White"
            author.keyword1 = "Romantic"
            author.keyword2 = "Science Fiction"
            author.numofbooks = 2
            author.numofcollected = 5
            await author.save()
            author = await Author.findOne({name: "Rusty"})
            validID2 = author._id
        } catch (error) {
            console.log(error)
        }
    })
    describe("Novel", () => {
        describe("GET/novels", () => {
            it("should GET all the novels", done => {
                request(server)
                    .get("/novels")
                    .set("Accept", "application/json")
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end((err, res) => {
                        try {
                            expect(res.body).to.be.a("array")
                            expect(res.body.length).to.equal(2)
                            let result = _.map(res.body, novel => {
                                return {
                                    name: novel.name,
                                    author: novel.author,
                                    type: novel.type,
                                    recommender: novel.recommender,
                                }
                            })
                            expect(result).to.deep.include({
                                name: "Rusty Hotel",
                                author: "Rusty",
                                type: "Horror",
                                recommender: "Merry"

                            })
                            expect(result).to.deep.include({
                                name: "Cube Escape",
                                author: "Rusty",
                                type: "Horror",
                                recommender: "Merry"

                            })
                            done()
                        } catch (e) {
                            done(e)
                        }
                    })
            })
        })
        describe("GET /novels/:id", () => {
            describe("when the id is valid", () => {
                it("should return the matching novel", done => {
                    request(server)
                        .get(`/novels/${validID}`)
                        .set("Accept", "application/json")
                        .expect("Content-Type", /json/)
                        .expect(200)
                        .end((err, res) => {
                            expect(res.body[0]).to.have.property("name", "Rusty Hotel")
                            expect(res.body[0]).to.have.property("author", "Rusty")
                            expect(res.body[0]).to.have.property("type", "Horror")
                            expect(res.body[0]).to.have.property("recommender", "Merry")
                            done(err)
                        })
                })
            })
            describe("when the id is invalid", () => {
                it("should return the NOT found message", done => {
                    request(server)
                        .get("/novels/1000000020202")
                        .set("Accept", "application/json")
                        .expect("Content-Type", /json/)
                        .expect(200)
                        .end((err, res) => {
                            expect(res.body.message).equals("Novel NOT Found!")
                            done(err)
                        })
                })
            })
        })
        describe("POST /novels", () => {
            it("should return can not be empty message", () => {
                const novel = {
                    name: "",
                    author: "Lily",
                    type: "Romantic",
                    recommender: "HP"
                }

                return request(server)
                    .post("/novels")
                    .send(novel)
                    .then(res => {
                        expect(res.body.message).equals("The novel name can not be empty")
                    })
            })
            it("should return novel already existed message", () => {
                const novel = {
                    name: "Rusty Hotel",
                    author: "Rusty",
                    type: "Horro",
                    recommender: "HP"
                }

                return request(server)
                    .post("/novels")
                    .send(novel)
                    .expect(200)
                    .then(res => {
                        expect(res.body.message).equals("The novel is already exist")
                    })
            })
            it("should return confirmation message and update mongodb", () => {
                const novel = {
                    name: "My Girl",
                    author: "Lily",
                    type: "Romantic",
                    recommender: "HP"
                }

                return request(server)
                    .post("/novels")
                    .send(novel)
                    .expect(200)
                    .then(res => {
                        expect(res.body.message).equals("Novel Successfully added")
                        validID = res.body.data._id
                    })
            })
            after(() => {
                return request(server)
                    .get(`/novels/${validID}`)
                    .expect(200)
                    .then(res => {
                        expect(res.body[0]).to.have.property("name", "My Girl")
                        expect(res.body[0]).to.have.property("author", "Lily")
                        expect(res.body[0]).to.have.property("type", "Romantic")
                        expect(res.body[0]).to.have.property("recommender", "HP")
                    })
            })
        })
        describe("PUT /novels/:id", () => {
            describe("when the id is valid", () => {

                it("should return a message and update the grade", () => {
                    return request(server)
                        .put(`/novels/${validID}`)
                        .send({"grade": 4})
                        .expect(200)
                        .then(resp => {
                            expect(resp.body).to.include({
                                message: "Novel Successfully graded!"
                            })
                            expect(resp.body.data).to.have.property("grade", 4)
                        })
                })
                after(() => {
                    return request(server)
                        .get(`/novels/${validID}`)
                        .expect(200)
                        .then(resp => {
                            expect(resp.body[0]).to.have.property("grade", 4)
                        })
                })
            })
            describe("when the id is invalid", () => {
                it("should return the Novel NOT Found! message", done => {
                    request(server)
                        .get("/novels/1000000020202")
                        .set("Accept", "application/json")
                        .expect("Content-Type", /json/)
                        .expect(200)
                        .end((err, res) => {
                            expect(res.body.message).equals("Novel NOT Found!")
                            done(err)
                        })
                })
            })
        })
        describe("DELETE /novels/:id", () => {
            describe("when the id is valid", () => {
                it("should return confirmation message and update database", () => {
                    request(server)
                        .delete(`novels/${validID}`)
                        .set("Accept", "application/json")
                        .expect("Content-Type", /json/)
                        .expect(200)
                        .then(res => {
                            expect(res.body.message).equals("Novels Successfully Deleted!")
                        })
                })
            })
            describe("when the id is invalid", () => {
                it("should return the NOT found message", () => {
                    request(server)
                        .delete("/novels/1000000020202")
                        .set("Accept", "application/json")
                        .expect("Content-Type", /json/)
                        .expect(200)
                        .then(res => {
                            expect(res.body.message).equals("Novels NOT Found!")
                        })
                })
            })
        })
    })
    describe("User", () => {
        describe("GET /user/:id", () => {
            describe("when the id is valid", () => {
                it("should return the matching user", done => {
                    request(server)
                        .get(`/user/${validID1}`)
                        .set("Accept", "application/json")
                        .expect("Content-Type", /json/)
                        .expect(200)
                        .end((err, res) => {
                            expect(res.body[0]).to.have.property("username", "Merry")
                            expect(res.body[0]).to.have.property("password", "123456")
                            expect(res.body[0]).to.have.property("email", "merry@ie")
                            done(err)
                        })
                })
            })
            describe("when the id is invalid", () => {
                it("should return the NOT found message", done => {
                    request(server)
                        .get("/user/10001000000020202")
                        .set("Accept", "application/json")
                        .expect("Content-Type", /json/)
                        .expect(200)
                        .end((err, res) => {
                            expect(res.body.message).equals("User NOT Found!")
                            done(err)
                        })
                })
            })
        })
        describe("POST /user", () => {
            it("should return username can not be empty message", () => {
                const user = {
                    username: "",
                    password: "asdfgh",
                    email: "sth@wit"
                }
                return request(server)
                    .post("/user")
                    .send(user)
                    .then(res => {
                        expect(res.body.message).equals("The username can not be empty")
                    })
            })
            it("should return password can not be empty message", () => {
                const user = {
                    username: "Justion",
                    password: "",
                    email: "sth@wit"
                }

                return request(server)
                    .post("/user")
                    .send(user)
                    .then(res => {
                        expect(res.body.message).equals("The password can not be empty")
                    })
            })
            it("should return email can not be empty message", () => {
                const user = {
                    username: "Justin",
                    password: "asdfgh",
                    email: ""
                }

                return request(server)
                    .post("/user")
                    .send(user)
                    .then(res => {
                        expect(res.body.message).equals("The email can not be empty")
                    })
            })
            it("should return username occupied message", () => {
                const user = {
                    username: "Merry",
                    password: "asdfgh",
                    email: "sth@wit"
                }

                return request(server)
                    .post("/user")
                    .send(user)
                    .expect(200)
                    .then(res => {
                        expect(res.body.message).equals("The username is occupied")
                    })
            })
            it("should return confirmation message and update mongodb", () => {
                const user = {
                    username: "Justin",
                    password: "asdfgh",
                    email: "Justinsth@wit"
                }

                return request(server)
                    .post("/user")
                    .send(user)
                    .expect(200)
                    .then(res => {
                        expect(res.body.message).equals("User Successfully registered")
                        validID1 = res.body.data._id
                    })
            })
            after(() => {
                return request(server)
                    .get(`/user/${validID1}`)
                    .expect(200)
                    .then(res => {
                        expect(res.body[0]).to.have.property("username", "Justin")
                        expect(res.body[0]).to.have.property("password", "asdfgh")
                        expect(res.body[0]).to.have.property("email", "Justinsth@wit")
                    })
            })
        })
        describe("POST /user/login", () => {
            it("should return username or password can not be empty message", () => {
                const user = {
                    username: "",
                    password: "asdfgh",
                }

                return request(server)
                    .post("/user/login")
                    .send(user)
                    .then(res => {
                        expect(res.body.message).equals("The username or password  can not be empty")
                    })
            })
            it("should return username is not exist message", () => {
                const user = {
                    username: "David",
                    password: "asdfgh",
                }

                return request(server)
                    .post("/user/login")
                    .send(user)
                    .expect(200)
                    .then(res => {
                        expect(res.body.message).equals("Username is not exist")
                    })
            })
            it("should return wrong password message", () => {
                const user = {
                    username: "Merry",
                    password: "asdfgh",
                }

                return request(server)
                    .post("/user/login")
                    .send(user)
                    .expect(200)
                    .then(res => {
                        expect(res.body.message).equals("Wrong Password")
                    })
            })
            it("should return confirmation message and update mongodb", () => {
                const user = {
                    username: "Merry",
                    password: "123456",
                }

                return request(server)
                    .post("/user/login")
                    .send(user)
                    .expect(200)
                    .then(res => {
                        expect(res.body.message).equals("Sign in Successfully")
                    })
            })
        })
        describe("PUT /user/:id", () => {
            describe("when the id is valid", () => {
                it("should return repeated password message", () => {
                    return request(server)
                        .put(`/user/${validID1}`)
                        .send({"password": "123456"})
                        .expect(200)
                        .then(resp => {
                            expect(resp.body).to.include({
                                message: "No change to the Password"
                            })
                            expect(resp.body.data).to.have.property("password", "123456")
                        })
                })
                it("should return a message and update the password", () => {
                    return request(server)
                        .put(`/user/${validID1}`)
                        .send({"password": "123456abc"})
                        .expect(200)
                        .then(resp => {
                            expect(resp.body).to.include({
                                message: "Password Successfully changed!"
                            })
                            expect(resp.body.data).to.have.property("password", "123456abc")
                        })
                })
                after(() => {
                    return request(server)
                        .get(`/user/${validID1}`)
                        .expect(200)
                        .then(resp => {
                            expect(resp.body[0]).to.have.property("password", "123456abc")
                        })
                })
            })
            describe("when the id is invalid", () => {
                it("should return the User NOT Found! message", done => {
                    request(server)
                        .get("/user/1000000020202")
                        .set("Accept", "application/json")
                        .expect("Content-Type", /json/)
                        .expect(200)
                        .end((err, res) => {
                            expect(res.body.message).equals("User NOT Found!")
                            done(err)
                        })
                })
            })
        })
    })
    describe("Author", () => {
        describe("GET/author", () => {
            it("should GET all the authors", done => {
                request(server)
                    .get("/author")
                    .set("Accept", "application/json")
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end((err, res) => {
                        try {
                            expect(res.body).to.be.a("array")
                            expect(res.body.length).to.equal(2)
                            let result = _.map(res.body, author => {
                                return {
                                    name: author.name,
                                    keyword1: author.keyword1,
                                    keyword2: author.keyword2,
                                    numofbooks: author.numofbooks,
                                    numofcollected: author.numofcollected
                                }
                            })
                            expect(result).to.deep.include({
                                name: "Rusty",
                                keyword1: "Horror",
                                keyword2: "Science Fiction",
                                numofbooks: 4,
                                numofcollected: 9

                            })
                            expect(result).to.deep.include({
                                name: "White",
                                keyword1: "Romantic",
                                keyword2: "Science Fiction",
                                numofbooks: 2,
                                numofcollected: 5
                            })
                            done()
                        } catch (e) {
                            done(e)
                        }
                    })
            })
        })
        describe("GET /author/:id", () => {
            describe("when the id is valid", () => {
                it("should return the matching author", done => {
                    request(server)
                        .get(`/author/${validID2}`)
                        .set("Accept", "application/json")
                        .expect("Content-Type", /json/)
                        .expect(200)
                        .end((err, res) => {
                            expect(res.body[0]).to.have.property("name", "Rusty")
                            expect(res.body[0]).to.have.property("keyword1", "Horror")
                            expect(res.body[0]).to.have.property("keyword2", "Science Fiction")
                            expect(res.body[0]).to.have.property("numofbooks", 4)
                            expect(res.body[0]).to.have.property("numofcollected", 9)
                            done(err)
                        })
                })
            })
            describe("when the id is invalid", () => {
                it("should return the NOT found message", done => {
                    request(server)
                        .get("/author/100021000000020202")
                        .set("Accept", "application/json")
                        .expect("Content-Type", /json/)
                        .expect(200)
                        .end((err, res) => {
                            expect(res.body.message).equals("Author NOT Found!")
                            done(err)
                        })
                })
            })
        })
        describe("POST /author", () => {
            it("should return can not be empty message", () => {
                const author = {
                    name: "",
                    keyword1: "Horror",
                    keyword2: "Science Fiction",
                    numofbooks: 4,
                }

                return request(server)
                    .post("/author")
                    .send(author)
                    .then(res => {
                        expect(res.body.message).equals("The author name can not be empty")
                    })
            })
            it("should return author already existed message", () => {
                const author = {
                    name: "Rusty",
                    keyword1: "Horror",
                    keyword2: "Science Fiction",
                    numofbooks: 4,
                }

                return request(server)
                    .post("/author")
                    .send(author)
                    .expect(200)
                    .then(res => {
                        expect(res.body.message).equals("The author is already exist")
                    })
            })
            it("should return confirmation message and update mongodb", () => {
                const author = {
                    name: "Ella",
                    keyword1: "History",
                    keyword2: "Whodunit",
                    numofbooks: 3,
                }

                return request(server)
                    .post("/author")
                    .send(author)
                    .expect(200)
                    .then(res => {
                        expect(res.body.message).equals("Author Successfully added")
                        validID2 = res.body.data._id
                    })
            })
            after(() => {
                return request(server)
                    .get(`/author/${validID2}`)
                    .expect(200)
                    .then(res => {
                        expect(res.body[0]).to.have.property("name", "Ella")
                        expect(res.body[0]).to.have.property("keyword1", "History")
                        expect(res.body[0]).to.have.property("keyword2", "Whodunit")
                        expect(res.body[0]).to.have.property("numofbooks", 3)
                        expect(res.body[0]).to.have.property("numofcollected", 0)
                    })
            })
        })
        describe("PUT /author/:id/collect", () => {
            describe("when the id is valid", () => {
                it("should return a message and the author number of collected increased by 1", () => {
                    return request(server)
                        .put(`/author/${validID2}/collect`)
                        .expect(200)
                        .then(resp => {
                            expect(resp.body).to.include({
                                message: "Author Successfully collected!"
                            })
                            expect(resp.body.data).to.have.property("numofcollected", 10)
                        })
                })
                after(() => {
                    return request(server)
                        .get(`/author/${validID2}`)
                        .set("Accept", "application/json")
                        .expect("Content-Type", /json/)
                        .expect(200)
                        .then(resp => {
                            expect(resp.body[0]).to.have.property("numofcollected", 10)
                        })
                })
            })
            describe("when the id is invalid", () => {
                it("should return a 404 and a message for invalid author id", () => {
                    return request(server)
                        .put("/author/11000100201/collect")
                        .expect(200)
                        .then(resp => {
                            expect(resp.body).to.include({
                                message: "Author NOT Found!"
                            })
                        })

                })
            })
        })
        describe("DELETE /author/:id", () => {
            describe("when the id is valid", () => {
                it("should return confirmation message", () => {
                    request(server)
                        .delete(`/author/${validID2}`)
                        .set("Accept", "application/json")
                        .expect("Content-Type", /json/)
                        .expect(200)
                        .then(resp => {
                            expect(resp.body).to.include({
                                message: "Author Successfully Deleted!"
                            })
                        })
                })
            })
            describe("when the id is invalid", () => {
                it("should return NOT found message", () => {
                    request(server)
                        .delete("/author/12001020100101")
                        .set("Accept", "application/json")
                        .expect("Content-Type", /json/)
                        .expect(200)
                        .then(resp => {
                            expect(resp.body).to.include({
                                message: "Author NOT Found!"
                            })
                        })
                })
            })
        })
    })
})
