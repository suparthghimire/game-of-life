const helpModal = document.querySelector("#help-modal");
const helpModalContent = document.querySelector("#modal-content");
const helpBtn = document.querySelector("#help-btn");
const closeHelpBtn = document.querySelector("#close-help");
helpBtn.addEventListener("click", () => {
  helpModal.classList.toggle("help-modal-on");
});

closeHelpBtn.addEventListener("click", () => {
  helpModal.classList.remove("help-modal-on");
});
