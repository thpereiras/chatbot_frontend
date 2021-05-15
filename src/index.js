const path = require("path")
const fs = require("fs")
const express = require("express")
const app = express()

const publicDirPath = path.join(__dirname, "./public")
app.use("/public", express.static(publicDirPath))

app.get("/", (req, res) => {
  let data = fs.readFileSync("src/index.html", "utf8")
  if (data)
    res.send(
      data
        .replace(
          "chatterbotUrlPlaceHolder",
          "const chatterbot_url = '" + process.env.CHATBOT_API_URL + "'"
        )
        .replace(
          "forceResponseRatingPlaceHolder",
          "const force_response_rating = " + process.env.FORCE_RESPONSE_RATING
        )
    )
})

app.listen(process.env.PORT, () => {
  console.log("Server is up on port " + process.env.PORT + ".")
})
