-- ??? ??????? ?? ??? ???
IF DB_ID('CampusRoutingDB') IS NOT NULL
    DROP DATABASE CampusRoutingDB;
GO

CREATE DATABASE CampusRoutingDB;
GO

USE CampusRoutingDB;
GO

CREATE TABLE Department (
    DepID INT IDENTITY PRIMARY KEY,
    DepName NVARCHAR(100) NOT NULL,
    DepPhone NVARCHAR(20),
    DepMngrID INT
);
GO

CREATE TABLE Student (
    StuID INT IDENTITY PRIMARY KEY,
    StudentNumber NVARCHAR(20) UNIQUE NOT NULL,
    Sname NVARCHAR(100) NOT NULL,
    Major NVARCHAR(50),
    StuDepID INT,
    Password NVARCHAR(100) NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Student_Department 
        FOREIGN KEY (StuDepID) REFERENCES Department(DepID)
);
GO

CREATE TABLE Path (
    PathID INT IDENTITY PRIMARY KEY,
    FromDepID INT NOT NULL,
    ToDepID INT NOT NULL,
    Distance INT,
    Description NVARCHAR(200),
    FOREIGN KEY (FromDepID) REFERENCES Department(DepID),
    FOREIGN KEY (ToDepID) REFERENCES Department(DepID)
);
GO

CREATE TABLE Favorite (
    FavID INT IDENTITY PRIMARY KEY,
    StuID INT NOT NULL,
    PathID INT NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (StuID) REFERENCES Student(StuID),
    FOREIGN KEY (PathID) REFERENCES Path(PathID)
);
GO

CREATE OR ALTER PROCEDURE RegisterStudent
    @StudentNumber NVARCHAR(20),
    @Sname NVARCHAR(100),
    @Major NVARCHAR(50),
    @StuDepID INT,
    @Password NVARCHAR(100)
AS
BEGIN
    INSERT INTO Student (StudentNumber, Sname, Major, StuDepID, Password)
    VALUES (@StudentNumber, @Sname, @Major, @StuDepID, @Password);
END;
GO

CREATE OR ALTER PROCEDURE LoginStudent
    @StudentNumber NVARCHAR(20),
    @Password NVARCHAR(100)
AS
BEGIN
    SELECT *
    FROM Student
    WHERE StudentNumber = @StudentNumber
      AND Password = @Password;
END;
GO
