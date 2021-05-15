$(document).ready(function () {
  const SESSION_ID =
    Date.now().toString(36) + Math.random().toString(36).substr(2)
  var conversation_started = false
  var conversation_ended = false

  var bot =
    '<div class="chatCont" id="chatCont">' +
    '<div class="rating-box" id="ratingBox">' +
    "<span>Avalie a conversação como chatbot:<span>" +
    '<div id="ratingContainer">' +
    '<input type="number"/>' +
    '<i class="rating-star fa fa-star" star-value="1"></i>' +
    '<i class="rating-star fa fa-star" star-value="2"></i>' +
    '<i class="rating-star fa fa-star" star-value="3"></i>' +
    '<i class="rating-star fa fa-star" star-value="4"></i>' +
    '<i class="rating-star fa fa-star" star-value="5"></i>' +
    "</div>" +
    "</div>" +
    '<div class="bot_profile">' +
    '<img src="/public/assets/img/bot2.svg" class="bot_p_img">' +
    '<div class="final-rating">Encerrar e avaliar</div>' +
    '<div class="close">' +
    '<i class="fa fa-window-close" aria-hidden="true" title="Fechar"></i>' +
    "</div>" +
    "</div><!--bot_profile end-->" +
    '<div id="result_div" class="resultDiv"></div>' +
    '<div class="chatForm" id="chat-div">' +
    '<div class="spinner">' +
    '<div class="bounce1"></div>' +
    '<div class="bounce2"></div>' +
    '<div class="bounce3"></div>' +
    "</div>" +
    '<input type="text" id="chat-input" autocomplete="off" placeholder="Digite aqui sua pergunta..."' +
    'class="form-control bot-txt"/>' +
    "</div>" +
    "</div><!--chatCont end-->" +
    '<div class="profile_div">' +
    '<div class="row">' +
    '<div class="col-hgt">' +
    '<img src="/public/assets/img/bot2.svg" class="img-circle img-profile">' +
    "</div><!--col-hgt end-->" +
    '<div class="col-hgt">' +
    '<div class="chat-txt">' +
    "Posso ajudar?" +
    "</div>" +
    "</div><!--col-hgt end-->" +
    "</div><!--row end-->" +
    "</div><!--profile_div end-->"

  $("bot").html(bot)

  $(".profile_div").click(function () {
    $(".profile_div").toggle()
    $(".chatCont").toggle()
    $(".bot_profile").toggle()
    $(".chatForm").toggle()
    document.getElementById("chat-input").focus()
  })

  $(".close").click(function () {
    $(".profile_div").toggle()
    $(".chatCont").toggle()
    $(".bot_profile").toggle()
    $(".chatForm").toggle()
    $(".rating-box").css("display", "none")
  })

  $("#chat-input").on("keyup keypress", function (e) {
    var keyCode = e.keyCode || e.which
    var text = $("#chat-input").val()
    if (keyCode === 13) {
      if (text == "" || $.trim(text) == "") {
        e.preventDefault()
        return false
      } else {
        $("#chat-input").blur()
        setUserResponse(text)
        send(text)
        e.preventDefault()
        return false
      }
    }
  })

  // Send request to API
  function send(text) {
    $.ajax({
      type: "POST",
      url: chatterbot_url + "/api/talk",
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      data: JSON.stringify({ message: stripHtml(text) }),
      success: function (data) {
        main(data.response)
      },
      error: function (xhr, status, error) {
        main(
          "Desculpe, estou com problemas no momento. Tente novamente mais tarde."
        )
      }
    })
  }

  function main(data) {
    setBotResponse(data)
    if (force_response_rating) {
      disable_chat()
    }
    conversation_started = true
  }

  function stripHtml(html) {
    let tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  }

  // Set bot response
  function setBotResponse(val) {
    setTimeout(function () {
      if ($.trim(val) == "") {
        val = "I couldn't get that. Let' try something else!"
        var BotResponse =
          '<p class="botResult">' + val + '</p><div class="clearfix"></div>'
        $(BotResponse).appendTo("#result_div")
      } else {
        val = val.replace(new RegExp("botResult\r?\n", "g"), "<br />")
        val = urlify(val)
        var BotResponse =
          '<p class="botResult">' +
          val +
          ' \
        <span class="rating"><a href="#" class="rating-down"><i class="fa fa-thumbs-o-down" title="Não ajudou!"></i></a> \
        <a href="#" class="rating-up"><i class="fa fa-thumbs-o-up" title="Ajudou!"></i></a></span> \
        </p><div class="clearfix"></div>'
        $(BotResponse).appendTo("#result_div")
      }
      scrollToBottomOfResults()
      hideSpinner()
    }, 500)
  }

  function setUserResponse(val) {
    val = stripHtml(val)
    var UserResponse =
      '<p class="userEnteredText">' + val + '</p><div class="clearfix"></div>'
    $(UserResponse).appendTo("#result_div")
    $("#chat-input").val("")
    scrollToBottomOfResults()
    showSpinner()
  }

  function scrollToBottomOfResults() {
    var terminalResultsDiv = document.getElementById("result_div")
    terminalResultsDiv.scrollTop = terminalResultsDiv.scrollHeight
  }

  function showSpinner() {
    $(".spinner").show()
  }
  function hideSpinner() {
    $(".spinner").hide()
  }

  function addRatingResponse(question, answer, rating) {
    $.ajax({
      type: "POST",
      url: chatterbot_url + "/rating/response",
      data: JSON.stringify({
        session: SESSION_ID,
        question: question,
        answer: answer,
        helped: helped
      }),
      success: function (response) {},
      contentType: "application/json",
      dataType: "json"
    })
    if (!conversation_ended) enable_chat()
  }

  function enable_chat() {
    $("#chat-input").prop("disabled", false)
    $("#chat-input").attr("placeholder", "Digite aqui sua pergunta...")
    $("#chat-input").css("background-color", "#F9F9F9")
    $("#chat-input").css("border-color", "#AAE591")
    $("#chat-input").focus()
  }

  function disable_chat() {
    $("#chat-input").prop("disabled", true)
    $("#chat-input").attr(
      "placeholder",
      "Avalie a resposta antes de continuar..."
    )
    $("#chat-input").css("background-color", "#E9E9E9")
    $("#chat-input").css("border-color", "#AAE591")
  }

  function end_chat() {
    $("#chat-input").prop("disabled", true)
    $("#chat-input").attr(
      "placeholder",
      "Conversação finalizada, obrigado pela colaboraçao!"
    )
    $("#chat-input").css("background-color", "#AAE591")
    $("#chat-input").css("border-color", "#AAE591")
    conversation_ended = true
  }

  $(document).on("click", ".rating-down", function () {
    let parent = this.parentNode
    let question = parent.parentNode.previousSibling.previousSibling
    let answer = parent.parentNode
    let questionTxt =
      question.textContent === undefined
        ? question.innerText
        : question.textContent
    let answerTxt =
      answer.textContent === undefined ? answer.innerText : answer.textContent
    this.parentNode.innerText = ""
    addRatingResponse(questionTxt.trim(), answerTxt.trim(), (helped = false))
  })
  $(document).on("click", ".rating-up", function () {
    let parent = this.parentNode.previousSibling
    let question = parent.parentNode.previousSibling.previousSibling
    let answer = parent.parentNode
    let questionTxt =
      question.textContent === undefined
        ? question.innerText
        : question.textContent
    let answerTxt =
      answer.textContent === undefined ? answer.innerText : answer.textContent
    this.parentNode.innerText = ""
    addRatingResponse(questionTxt.trim(), answerTxt.trim(), (helped = true))
  })

  function addRatingFinal(rating) {
    $.ajax({
      type: "POST",
      url: chatterbot_url + "/rating/final",
      data: JSON.stringify({
        session: SESSION_ID,
        rating: rating
      }),
      success: function (response) {
        console.log(response)
      },
      contentType: "application/json",
      dataType: "json"
    })
  }

  $(document).on("click", ".final-rating", function () {
    $(".rating-box").toggle()
  })

  $(".rating-star").hover(addClassHover)
  $(".rating-star").mouseleave(removeClassHover)
  $(".rating-star").click(selectItem)

  function addClassHover() {
    $(".rating-star").prevAll().removeClass("hovered")
    $(this).prevAll().addClass("hovered")
  }
  function removeClassHover() {
    $(".rating-star").prevAll().removeClass("hovered")
  }
  function selectItem() {
    if (conversation_ended !== true) {
      $(".rating-star").removeClass("selected")
      $(this).prevAll().addClass("selected")
      $(this).addClass("selected")
      $(this).nextAll().addClass("deselected")
      $(this).nextAll().unbind()
      var starValue = $(this).attr("star-value")
      if (conversation_started) {
        addRatingFinal(starValue)
      }
      end_chat()
    }
  }
  function urlify(text) {
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener">$1</a>')
  }
})
