function saveOptions(e) {
  browser.storage.local.set({
    colour: document.querySelector("#colour").value
  });
}

function restoreOptions() {
  browser.storage.local.get('colour', (res) => {
    document.querySelector("#colour").value = res.colour || 'Firefox red';
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);