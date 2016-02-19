var xss = "javascript:/*</style></script>/**/ /<script>1/(alert(1337))//</script>";
html`<a href="${xss}"
   onclick="${xss}"
   >${xss}</a>
  <script>var x = '${xss}'</script>
  <style>
    p {
      font-family: "${xss}";
      background: url(/images?q=${xss});
      left: ${xss}
    }
  </style>`.forEach(function(node) {
  document.body.appendChild(node);
});