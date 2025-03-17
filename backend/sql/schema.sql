
CREATE TABLE Useraccount (
    username varchar(25) PRIMARY KEY, 
    fname varchar(25), 
    lname varchar(25), 
    pass_word varchar(50)
);
CREATE TABLE Folder (
    fid int PRIMARY KEY, 
    folder_name varchar(25)
);
CREATE TABLE Portolio (
    pid int REFERENCES Folder(fid) NOT NULL, 
    amount float
);
CREATE TABLE Stocklist (
    slid int REFERENCES Folder(fid) NOT NULL, 
    public BOOLEAN
);
CREATE TABLE Stock (
    symbol varchar(5) PRIMARY KEY, 
);
CREATE TABLE Stockdata (
    symbol varchar(5) REFERENCES Stock(sy), 
    time_stamp date, 
    high real, 
    low real, 
    close real, 
    volume int, 
    PRIMARY KEY(symbol, time_stamp)
);
CREATE TABLE Creates (
    username varchar(25)  REFERENCES Useraccount(username) NOT NULL, 
    fid int  REFERENCES Folder(fid) NOT NULL
);
CREATE TABLE Stockholding (
    fid int  REFERENCES Folder(fid) NOT NULL, 
    symbol varchar(5)  REFERENCES Stock(symbol) NOT NULL, 
    share int NOT NULL
);