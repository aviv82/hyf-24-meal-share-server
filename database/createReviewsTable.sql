CREATE TABLE Reviews (
Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
Title varchar(200) UNIQUE,
[Description] text(500),
Stars int,
CreatedDate date,
MealId INTEGER,
FOREIGN KEY (MealId) REFERENCES Meals (MealId)
)