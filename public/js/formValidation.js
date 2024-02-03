"use strict";
(function () {
  const forms = document.querySelectorAll(".from-validate");

  Array.from(forms).forEach(function (form) {
    form.addEventListener(
      "submit",
      function (event) {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }

        form.classList.add("was-validated");
      },
      false
    );
  });
})();

window.onload = function () {
  const formFile = document.getElementById("formFile");
  if (formFile) {
    formFile.onchange = function () {
      if (this.files.length > 6) {
        alert("You can only upload a maximum of 5 files");
        this.value = "";
      }
    };
  }
};
