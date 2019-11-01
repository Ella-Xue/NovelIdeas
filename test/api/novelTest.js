const chai = require("chai");
const expect = chai.expect;
const request = require("supertest");
const MongoMemoryServer = require("mongodb-memory-server").MongoMemoryServer;
const Novel = require("../../models/novels");
const mongoose = require("mongoose");

const _ = require("lodash");
let server;
let mongod;
let db, validID;

describe("Novel", () => {
    before(async () => {
        try {
            mongod = new MongoMemoryServer({
                instance: {
                    port: 27017,
                    dbPath: "./test/database",
                    dbName: "novels"
                }
            });
            await mongod.getConnectionString();

            mongoose.connect("mongodb://localhost:27017/novels", {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            server = require("../../bin/www");
            db = mongoose.connection;
        } catch (error) {
            console.log(error);
        }
    })

    after(async () => {
        try {
            await mongoose.connection.db.dropDatabase();
        } catch (error) {
            console.log(error);
        }
    });

    beforeEach(async () => {
        try {
            await Novel.deleteMany({});
            let novel = new Novel();
            novel.name = "Rusty Hotel";
            novel.author = "Rusty";
            novel.type = "Horror";
            novel.recommender = "Merry";
            await novel.save();
            novel = new Novel();
            novel.name = "Cube Escape";
            novel.author = "Rusty";
            novel.type = "Horror";
            novel.recommender = "Merry";
            await novel.save();
            novel = await Novel.findOne({ name:"Rusty Hotel" });
            validID = novel._id;
        } catch (error) {
            console.log(error);
        }
    });

    describe("GET/novels", () => {
        it("should GET all the novels", done => {
            request(server)
                .get("/novels")
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200)
                .end((err, res) => {
                    try {
                        expect(res.body).to.be.a("array");
                        expect(res.body.length).to.equal(2);
                        let result = _.map(res.body, novel => {
                            return {
                                name: novel.name,
                                author: novel.author,
                                type: novel.type,
                                recommender: novel.recommender,
                            };
                        });
                        expect(result).to.deep.include({
                            name:"Rusty Hotel",
                            author:"Rusty",
                            type:"Horror",
                            recommender:"Merry"

                        });
                        expect(result).to.deep.include({
                            name:"Cube Escape",
                            author:"Rusty",
                            type:"Horror",
                            recommender:"Merry"

                        });
                        done();
                    } catch (e) {
                        done(e);
                    }
                });
        });
    });
    describe("GET /novels/:id", () => {
        describe("when the id is valid", () => {
            it("should return the matching novel", done => {
                request(server)
                    .get(`/novels/${validID}`)
                    .set("Accept", "application/json")
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end((err, res) => {
                        expect(res.body[0]).to.have.property("name", "Rusty Hotel");
                        expect(res.body[0]).to.have.property("author", "Rusty");
                        expect(res.body[0]).to.have.property("type", "Horror");
                        expect(res.body[0]).to.have.property("recommender", "Merry");
                        done(err);
                    });
            });
        });
        describe("when the id is invalid", () => {
            it("should return the NOT found message", done => {
                request(server)
                    .get("/novels/1000000020202")
                    .set("Accept", "application/json")
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end((err, res) => {
                        expect(res.body.message).equals("Novel NOT Found!");
                        done(err);
                    });
            });
        });
    });
});
