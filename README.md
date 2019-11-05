# Assignment 1 - Agile Software Practice.
# Novel-ideas


###Name: Yi Xue. Student number: 20086419

In this project there are some functions:User can record and share the novels and authors the like in the app and manage them. 

####gitHub:https://github.com/Ella-Xue/NovelIdeas.git
## API endpoints.
user:

    app.get('/user/:id', user.userInfo);
    app.post('/user',user.register);
    app.post('/user/login',user.login);
    app.put('/user/:id', user.editPassword);
  a post for register
  
  a post for login with username and password authentication
  
  a get for user to see his own information
  
  a put for user to change the password
  
novels:

    app.get('/novels', novels.findAll);
    app.get('/novels/:id', novels.findOne);
    app.post('/novels',novels.addNovel);
    app.put('/novels/:id', novels.giveGrade);
    app.delete('/novels/:id', novels.deleteNovel);
    
  a get to get all novels information
  
  a get to get a novel information
  
  a post to add new novels
  
  a put to give a grade to the novel
  
  a deleteto delete the novel
  
author:

    app.get('/author', author.findAll);
    app.get('/author/:id', author.findOne);
    app.post('/author', author.addAuthor);
    app.put('/author/:id/collect', author.collectAuthor);
    app.delete('/author/:id', author.removeCollection);
    
  a get to get all author information
  
  a get to get a author information
  
  a post to recommend a new author
  
  a put to collect the author, add 1 to the author’s number of collected
  
  a delete to remove the author
  
###Introduction and Tech

A web app developed with nodejs, express and mongodb. 
NodeJS version v10.16.3 basic core development language
NNPM version 6.9.0
Express is a simple and flexible node.js Web application framework that offers a range of powerful features to help you create a variety of Web applications, as well as rich HTTP tools.
Mongo version v4.2.1

##Test results:
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Novel Ideals
      GET/novels 
    GET /novels 200 8.263 ms - 612
        √ should GET all the novels
      GET /novels/:id
        when the id is valid
    GET /novels/5dc144845653d220bc2f19b5 200 2.698 ms - 307
          √ should return the matching novel
        when the id is invalid
    GET /novels/1000000020202 200 2.060 ms - 249
          √ should return the NOT found message
      POST /novels
    POST /novels 200 23.660 ms - 45
        √ should return can not be empty message
    POST /novels 200 1.750 ms - 54
        √ should return novel already existed message
    POST /novels 200 3.272 ms - 168
        √ should return confirmation message and update mongodb
    GET /novels/5dc144845653d220bc2f19d3 200 2.738 ms - 301
      PUT /novels/:id
        when the id is valid
    PUT /novels/5dc144845653d220bc2f19d4 200 7.476 ms - 176
          √ should return a message and update the grade
    GET /novels/5dc144845653d220bc2f19d4 200 1.773 ms - 307
        when the id is invalid
    GET /novels/1000000020202 200 0.595 ms - 249
          √ should return the Novel NOT Found! message
    DELETE /novels/:id
        when the id is valid
          √ should return confirmation message and update database
        when the id is invalid
          √ should return the NOT found message
    DELETE /novels/1000000020202 200 1.245 ms - 250
    User
      GET /user/:id
        when the id is valid
    GET /user/5dc144845653d220bc2f19ee 200 2.184 ms - 235
          √ should return the matching user
        when the id is invalid
    GET /user/10001000000020202 200 0.569 ms - 259
          √ should return the NOT found message
      POST /user
    POST /user 200 0.390 ms - 43
        √ should return username can not be empty message
    POST /user 200 0.347 ms - 43
        √ should return password can not be empty message
    POST /user 200 0.333 ms - 40
        √ should return email can not be empty message
    POST /user 200 1.503 ms - 52
        √ should return username occupied message
    POST /user 200 3.129 ms - 156
        √ should return confirmation message and update mongodb
    GET /user/5dc144855653d220bc2f1a16 200 1.718 ms - 241
      POST /user/login
    POST /user/login 200 0.504 ms - 56
        √ should return username or password can not be empty message
    POST /user/login 200 1.385 ms - 35
        √ should return username is not exist message
    POST /user/login 200 1.467 ms - 28
        √ should return wrong password message
    POST /user/login 200 1.436 ms - 142
        √ should return confirmation message and update mongodb
      PUT /user/:id
        when the id is valid
    PUT /user/5dc144855653d220bc2f1a31 200 1.891 ms - 147
          √ should return repeated password message
    PUT /user/5dc144855653d220bc2f1a37 200 4.108 ms - 155
          √ should return a message and update the password
    GET /user/5dc144855653d220bc2f1a37 200 1.871 ms - 238
        when the id is invalid
    GET /user/1000000020202 200 0.669 ms - 247
          √ should return the User NOT Found! message
    Author
      GET/author
    GET /author 200 2.689 ms - 638
        √ should GET all the authors
      GET /author/:id
        when the id is valid
    GET /author/5dc144855653d220bc2f1a4b 200 2.152 ms - 319
          √ should return the matching author
        when the id is invalid
    GET /author/100021000000020202 200 0.958 ms - 266
          √ should return the NOT found message
      POST /author
    POST /author 200 0.583 ms - 46
        √ should return can not be empty message
    POST /author 200 1.524 ms - 55
        √ should return author already existed message
    POST /author 200 2.845 ms - 180
        √ should return confirmation message and update mongodb
    GET /author/5dc144855653d220bc2f1a65 200 1.718 ms - 312
      PUT /author/:id/collect
        when the id is valid
    PUT /author/5dc144855653d220bc2f1a6a/collect 200 4.891 ms - 193
          √ should return a message and the author number of collected increased by 1
    GET /author/5dc144855653d220bc2f1a6a 200 2.465 ms - 320
        when the id is invalid
    PUT /author/11000100201/collect 200 0.353 ms - 245
          √ should return a 404 and a message for invalid author id
      DELETE /author/:id
        when the id is valid
          √ should return confirmation message
        when the id is invalid
    DELETE /author/5dc144855653d220bc2f1a76 200 3.175 ms - 42
          √ should return NOT found message
    DELETE /author/12001020100101 200 0.414 ms - 254


    34 passing (4s)
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
## Data model.
    
[datamodel]: data_model.PNG
