const SUPABASE_URL =
‎    "https://hequpnbrqvcchinhaqfy.supabase.co/rest/v1/";
‎
‎const SUPABASE_ANON_KEY =
‎    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhlcXVwbmJycXZjY2hpbmhhcWZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MzcxNzgsImV4cCI6MjEwNTMxMzE3OH0.AMNE8lRwyzQrUUPx-L2xJ31u_SW3iAPESD7FJo5RlTg";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );


// GET CODE FROM URL

const params =
    new URLSearchParams(
        window.location.search
    );


const accessCode =
    params.get("code");


// LOAD LETTER

async function loadLetter() {

    const loading =
        document.getElementById(
            "loading"
        );


    const letterSection =
        document.getElementById(
            "letterSection"
        );


    const errorSection =
        document.getElementById(
            "errorSection"
        );


    if (!accessCode) {

        loading.classList.add("hidden");

        errorSection.classList.remove(
            "hidden"
        );

        return;
    }


    const {
        data,
        error
    } = await supabaseClient
        .from("letters")
        .select(
            "id, recipient_name, batch, team, letter_content"
        )
        .eq(
            "access_code",
            accessCode
        )
        .maybeSingle();


    if (error || !data) {

        console.error(error);

        loading.classList.add("hidden");

        errorSection.classList.remove(
            "hidden"
        );

        return;
    }


    document.getElementById(
        "recipientDisplay"
    ).textContent =
        data.recipient_name;


    document.getElementById(
        "batchDisplay"
    ).textContent =
        data.team
            ? `${data.batch} • ${data.team}`
            : data.batch;


    document.getElementById(
        "letterContent"
    ).textContent =
        data.letter_content;


    window.currentLetterId =
        data.id;


    loading.classList.add(
        "hidden"
    );


    letterSection.classList.remove(
        "hidden"
    );
}


// SEND REPLY

async function sendReply() {

    const reply =
        document
            .getElementById(
                "replyContent"
            )
            .value
            .trim();


    const message =
        document.getElementById(
            "replyMessage"
        );


    if (!reply) {

        message.textContent =
            "Please write a reply first.";

        return;
    }


    if (!window.currentLetterId) {

        message.textContent =
            "Letter not loaded.";

        return;
    }


    const {
        error
    } = await supabaseClient
        .from("replies")
        .insert({

            letter_id:
                window.currentLetterId,

            reply_content:
                reply

        });


    if (error) {

        console.error(error);

        message.textContent =
            "Unable to send reply.";

        return;
    }


    document
        .getElementById(
            "replyContent"
        )
        .value = "";


    message.textContent =
        "Your reply has been sent.";

}


// START

loadLetter();
