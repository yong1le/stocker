
CREATE TABLE Useraccount (
    username varchar(25) PRIMARY KEY, 
    fname varchar(25), 
    lname varchar(25), 
    pass_word varchar(50)
);
CREATE TABLE Folder (
    fid SERIAL PRIMARY KEY, 
    folder_name varchar(25)
);
CREATE TABLE Portfolio (
    pid SERIAL PRIMARY KEY, 
    amount float,
    CHECK (amount >= 0),
    FOREIGN KEY (pid) REFERENCES Folder(fid)
        ON DELETE CASCADE
);
CREATE TYPE vis_enum AS ENUM ('private', 'shared', 'public');
CREATE TABLE Stocklist (
    slid SERIAL PRIMARY KEY, 
    visibility vis_enum NOT NULL DEFAULT 'private',
    FOREIGN KEY (slid) REFERENCES Folder(fid)
        ON DELETE CASCADE
);
CREATE TABLE Stock (
    symbol varchar(5) PRIMARY KEY
);
CREATE TABLE Stockdata (
    symbol varchar(5) REFERENCES Stock(symbol), 
    time_stamp date, 
    open real,
    high real, 
    low real, 
    close real, 
    volume int, 
    PRIMARY KEY(symbol, time_stamp)
);
CREATE TABLE Creates (
    username varchar(25)  REFERENCES Useraccount(username) NOT NULL, 
    fid int NOT NULL,
    FOREIGN KEY (fid) REFERENCES Folder(fid)
        ON DELETE CASCADE
);
CREATE TABLE Stockholding (
    fid int NOT NULL REFERENCES Folder(fid)
        ON DELETE CASCADE, 
    symbol varchar(5)  REFERENCES Stock(symbol) NOT NULL, 
    share int NOT NULL CHECK (share > 0),
    PRIMARY KEY (fid, symbol)
);
CREATE TYPE friend_enum AS ENUM ('pending', 'accepted', 'rejected', 'removed');

CREATE Table Friends (
    uid1 VARCHAR(25) REFERENCES Useraccount(username),
    uid2 VARCHAR(25) REFERENCES Useraccount(username),
    friend_status friend_enum DEFAULT 'pending',
    reject_time TIMESTAMP NULL,
    remove_time TIMESTAMP NULL,
    PRIMARY Key(uid1, uid2)
);

CREATE TABLE Shares(
    creator VARCHAR(25) REFERENCES Useraccount(username),
    shared_with VARCHAR(25) REFERENCES Useraccount(username),
    slid int REFERENCES Stocklist(slid)
        ON DELETE CASCADE, 
    PRIMARY KEY (creator, shared_with, slid)
);

CREATE TABLE Reviews(
    reviewer VARCHAR(25) REFERENCES Useraccount(username),
    slid int REFERENCES Stocklist(slid)
        ON DELETE CASCADE, 
    content VARCHAR(4000) DEFAULT '',
    PRIMARY KEY (reviewer, slid)
);
CREATE TYPE transaction_enum AS ENUM ('bank', 'transfer', 'stock');
CREATE Table Transaction (
    tid SERIAL PRIMARY KEY,
    time_stamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    pid SERIAL NOT NULL REFERENCES Portfolio (pid)
        ON DELETE CASCADE,
    transaction_type transaction_enum NOT NULL DEFAULT 'bank',
    amount float NOT NULL,
    other_pid INT DEFAULT NULL REFERENCES Portfolio(pid) 
        ON DELETE CASCADE,
    stock_symbol VARCHAR(5) REFERENCES Stock(symbol)
        ON DELETE CASCADE,
    stock_shares int
);