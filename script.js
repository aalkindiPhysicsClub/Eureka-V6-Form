const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzrtyQde5JlSMGJoP4P7-U4sq1r2fKxIlOe7vI6mCdhYGvjBAoYoG-RKMvNCZql9Fv9/exec'
document.addEventListener('DOMContentLoaded', function () {
    tickClock();
    setInterval(tickClock, 1000);

    document.getElementById('application-form').addEventListener('submit', function (event) {
        event.preventDefault();
        submitApplication();
    });
});

function tickClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const clock = document.getElementById('hudClock');
    if (clock) {
        clock.textContent = hours + ':' + minutes;
    }
}

function setInvalid(id, isInvalid) {
    const group = document.getElementById(id).closest('.form-group');
    if (group) {
        group.classList.toggle('invalid', isInvalid);
    }
}

function validateForm() {
    const firstName = document.getElementById('firstName').value.trim();
    const familyName = document.getElementById('familyName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const comWork = document.getElementById('comWork').value.trim();
    const joinReason = document.getElementById('joinReason').value.trim();

    let firstInvalid = null;

    const nameOk = firstName.length >= 2;
    setInvalid('firstName', !nameOk);
    if (!nameOk && !firstInvalid) firstInvalid = 'firstName';

    const familyOk = familyName.length >= 2;
    setInvalid('familyName', !familyOk);
    if (!familyOk && !firstInvalid) firstInvalid = 'familyName';

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    setInvalid('email', !emailOk);
    if (!emailOk && !firstInvalid) firstInvalid = 'email';

    const phoneOk = /^[0-9+\-\s()]{7,}$/.test(phone);
    setInvalid('phone', !phoneOk);
    if (!phoneOk && !firstInvalid) firstInvalid = 'phone';

    const comWorkOk = comWork.length >= 2;
    setInvalid('comWork', !comWorkOk);
    if (!comWorkOk && !firstInvalid) firstInvalid = 'comWork';

    const reasonOk = joinReason.length >= 5;
    setInvalid('joinReason', !reasonOk);
    if (!reasonOk && !firstInvalid) firstInvalid = 'joinReason';

    if (firstInvalid) {
        document.getElementById(firstInvalid).focus();
        return null;
    }

    return { firstName, familyName, email, phone, comWork, joinReason };
}

function submitApplication() {
    const data = validateForm();
    if (!data) {
        return;
    }

    const formData = new FormData();
    formData.append('firstName', data.firstName);
    formData.append('familyName', data.familyName);
    formData.append('fullName', data.firstName + ' ' + data.familyName);
    formData.append('email', data.email);
    formData.append('phone', data.phone);
    formData.append('comWork', data.comWork);
    formData.append('joinReason', data.joinReason);

    const submitButton = document.getElementById('submitBtn');
    submitButton.textContent = 'Loading...';
    submitButton.disabled = true;

    fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: formData
    })
        .then(function (response) {
            if (response.ok) {
                return response.text().then(function (text) {
                    return text ? JSON.parse(text) : { result: 'success' };
                });
            }
            throw new Error('HTTP error! Status: ' + response.status);
        })
      .then(function (payload) {
    console.log("Google Apps Script response:", payload);

    if (payload.success === true ||
        payload.result === "success") {
        showSuccessModal();

        setTimeout(function () {
            window.location.reload();
        }, 2000);
    } else {
        console.error("Registration response:", payload);
        alert("Mission failed: " + (payload.message || "Unknown error"));
    }
})
        .catch(function (error) {
            console.error('Network or Fetch Error:', error);
            alert('Could not reach HQ. Check your connection.');
        })
        .finally(function () {
            submitButton.textContent = 'Start Mission';
            submitButton.disabled = false;
        });
}

function showSuccessModal() {
    document.getElementById('successModal').classList.add('show');
}

function resetForm() {
    document.getElementById('successModal').classList.remove('show');
    document.getElementById('application-form').reset();
    document.querySelectorAll('.form-group.invalid').forEach(function (group) {
        group.classList.remove('invalid');
    });
}
