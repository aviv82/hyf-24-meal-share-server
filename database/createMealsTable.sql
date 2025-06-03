CREATE TABLE Meals (
MealId INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
Title varchar(200) UNIQUE,
[Description] text(500),
[Location] varchar(200),
[When] datetime,
MaxReservations int,
Price decimal,
CreatedDate date
)