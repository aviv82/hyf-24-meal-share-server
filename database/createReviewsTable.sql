CREATE TABLE Reviews (
Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
Title varchar(200) UNIQUE NOT NULL,
[Description] text(500),
Stars int NOT NULL,
CreatedDate date,
MealId INTEGER,
FOREIGN KEY (MealId) REFERENCES Meals (MealId)
)