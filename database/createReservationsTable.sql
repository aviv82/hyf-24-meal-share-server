CREATE TABLE Reservations (
Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
NumberOfGuests int,
ContactPhoneNumber varchar(200) NOT NULL,
ContactName varchar(200),
CreatedDate date,
MealId INTEGER,
FOREIGN KEY (MealId) REFERENCES Meals (MealId)
)