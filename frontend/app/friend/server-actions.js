"use server";

export const fetchFriendList = async (user, setFriends) => {
    try {
        const res = await fetch(`http://localhost:8080/friend/view/all/${user}`);
        if (!res.ok) throw new Error("Failed to fetch friends");
        setFriends(await res.json());
    } catch (error) {
        console.error(error);
    }
};

export const fetchIncomingFriendReq = async (username) => {
    try {
        const res = await fetch(`http://localhost:8080/friend/view/requests/in/${username}`);
        if (!res.ok) throw new Error("Failed to fetch requests");
        return await res.json();
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const fetchOutgoingFriendReq = async (username) => {
    try {
        const res = await fetch(`http://localhost:8080/friend/view/requests/out/${username}`);
        if (!res.ok) throw new Error("Failed to fetch requests");
        return await res.json();
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const handleFriendAction = async (username, friend, action) => {
    const endpoint = action === "accept" ? "/accept" : "/reject";
    try {
        const url = `http://localhost:8080/friend${endpoint}/${username}`;
        
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ friend }),
        });

        if (!res.ok) throw new Error(`Failed to ${action} friend request`);

        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
};

export const sendrequest = async (username, friend) => {
    try {
        const url = `http://localhost:8080/friend/sendrequest/${username}`;
        
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ friend }),
        });

        if (!res.ok) throw new Error(`Failed to send friend request`);

        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
};

export const removeFriend = async (username, friend) => {
    try {
        const url = `http://localhost:8080/friend/remove/${username}`;
        
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ friend }),
        });

        if (!res.ok) throw new Error(`Failed to send remove`);

        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
};