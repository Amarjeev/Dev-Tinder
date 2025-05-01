const express = require("express");
const app = express();

app.use((req, res) => {
    res.send('Hello amarjeev')
})




app.listen(3000, () => console.log("server started Port number :3000"));
