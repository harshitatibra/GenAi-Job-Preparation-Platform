import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem("authUser");
            return savedUser ? JSON.parse(savedUser) : null;
        } catch (error) {
            console.error("Failed to read saved user", error);
            return null;
        }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            localStorage.setItem("authUser", JSON.stringify(user));
            return;
        }

        localStorage.removeItem("authUser");
    }, [user]);

    return (
        <AuthContext.Provider value={{ user, setUser, loading, setLoading }}>
            {children}
        </AuthContext.Provider>
    );
};