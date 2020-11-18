DROP TABLE IF EXISTS harry;

CREATE TABLE harry(
    id SERIAL PRIMARY KEY,
   name VARCHAR(256),
  patronus VARCHAR(10000),
  image VARCHAR(256),
  alive VARCHAR(256) 
  
)