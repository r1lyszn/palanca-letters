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


// CHECK LOGIN

async function checkLogin() {

    const {
        data: { session }
    } = await supabaseClient.auth.getSession();


    if (session) {

        document
            .getElementById("loginSection")
            .classList.add("hidden");


        document
            .getElementById("dashboard")
            .classList.remove("hidden");


        loadLetters();

    } else {

        document
            .getElementById("loginSection")
            .classList.remove("hidden");


        document
            .getElementById("dashboard")
            .classList.add("hidden");
    }
}


// LOGIN

async function login() {

    const email =
        document.getElementById("email").value.trim();


    const password =
        document.getElementById("password").value;


    const message =
        document.getElementById("loginMessage");


    if (!email || !password) {

        message.textContent =
            "Please enter your email and password.";

        return;
    }


    const { error } =
        await supabaseClient.auth.signInWithPassword({

            email: email,
            password: password

        });


    if (error) {

        message.textContent =
            "Login failed: " + error.message;

        return;
    }


    message.textContent = "";

    checkLogin();
}


// LOGOUT

async function logout() {

    await supabaseClient.auth.signOut();

    location.reload();
}


// GENERATE PRIVATE CODE

function generateCode() {

    const characters =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";


    let code = "";


    for (let i = 0; i < 12; i++) {

        code += characters.charAt(
            Math.floor(
                Math.random() * characters.length
            )
        );

    }


    return code;
}


// CREATE LETTER

async function createLetter() {

    const recipientName =
        document
            .getElementById("recipientName")
            .value
            .trim();


    const batch =
        document
            .getElementById("batch")
            .value;


    const team =
        document
            .getElementById("team")
            .value
            .trim();


    const letterContent =
        document
            .getElementById("letterContent")
            .value
            .trim();


    const message =
        document
            .getElementById("createMessage");


    if (!recipientName || !letterContent) {

        message.textContent =
            "Please enter the recipient and letter.";

        return;
    }


    const accessCode =
        generateCode();


    const {
        error
    } = await supabaseClient
        .from("letters")
        .insert({

            recipient_name: recipientName,

            batch: batch,

            team: team,

            letter_content: letterContent,

            access_code: accessCode

        });


    if (error) {

        message.textContent =
            "Error: " + error.message;

        return;
    }


    message.textContent =
        "Letter created successfully.";


    document
        .getElementById("recipientName")
        .value = "";


    document
        .getElementById("team")
        .value = "";


    document
        .getElementById("letterContent")
        .value = "";


    loadLetters();
}


// LOAD LETTERS

async function loadLetters() {

    const list =
        document.getElementById("lettersList");


    list.innerHTML =
        "<p>Loading letters...</p>";


    const {
        data,
        error
    } = await supabaseClient
        .from("letters")
        .select("*")
        .order(
            "created_at",
            {
                ascending: false
            }
        );


    if (error) {

        list.innerHTML =
            "<p>Error loading letters.</p>";

        console.error(error);

        return;
    }


    if (!data || data.length === 0) {

        list.innerHTML =
            "<p>No letters created yet.</p>";

        return;
    }


    list.innerHTML = "";


    data.forEach(letter => {

        const item =
            document.createElement("div");


        item.className =
            "letter-item";


        const link =
            `${window.location.origin}` +
            `${window.location.pathname.replace(
                "admin.html",
                "letter.html"
            )}` +
            `?code=${encodeURIComponent(
                letter.access_code
            )}`;


        item.innerHTML = `

            <h3>
                ${escapeHTML(
                    letter.recipient_name
                )}
            </h3>

            <p>
                ${escapeHTML(
                    letter.batch
                )}

                ${
                    letter.team
                    ? " • " +
                      escapeHTML(letter.team)
                    : ""
                }
            </p>

            <p>
                <strong>Private Code:</strong>
                ${escapeHTML(
                    letter.access_code
                )}
            </p>

            <button
                onclick="showQR(
                    '${escapeJS(link)}',
                    '${escapeJS(
                        letter.recipient_name
                    )}'
                )"
            >
                Show QR
            </button>

            <button
                onclick="copyLink(
                    '${escapeJS(link)}'
                )"
            >
                Copy Link
            </button>

        `;


        list.appendChild(item);

    });
}


// SHOW QR

function showQR(link, recipient) {

    const qrArea =
        document.getElementById(
            "qrPrintArea"
        );


    qrArea.innerHTML = "";


    const item =
        document.createElement("div");


    item.className =
        "qr-item";


    const title =
        document.createElement("h3");


    title.textContent =
        recipient;


    const qr =
        document.createElement("div");


    item.appendChild(title);

    item.appendChild(qr);

    qrArea.appendChild(item);


    new QRCode(qr, {

        text: link,

        width: 180,

        height: 180

    });


    qrArea.scrollIntoView({
        behavior: "smooth"
    });
}


// COPY LINK

async function copyLink(link) {

    try {

        await navigator.clipboard.writeText(link);

        alert("Letter link copied.");

    } catch {

        alert(
            "Copy failed. Please copy the link manually."
        );

    }
}


// PRINT

function printQRCodes() {

    window.print();
}


// HTML SECURITY

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// JAVASCRIPT SECURITY

function escapeJS(value) {

    return String(value)
        .replaceAll("\\", "\\\\")
        .replaceAll("'", "\\'")
        .replaceAll("\n", "\\n")
        .replaceAll("\r", "\\r");
}


// START

checkLogin();
