const login = async () => {
    try {
        const res = await fetch("http://localhost:4000/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ phone: "+919999999999", password: "admin123" })
        });
        const text = await res.text();
        console.log("STATUS:", res.status);
        console.log("RESPONSE:", text);
    } catch(e) {
        console.error("ERROR:", e);
    }
}
login();
