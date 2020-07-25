(function () {
  function operatingSytem () {  
    let os;
    if (navigator.appVersion.indexOf('Win') !== -1) os = 'windows'; 
    if (navigator.appVersion.indexOf('Mac') !== -1) os = 'osx'; 
    if (navigator.appVersion.indexOf('FreeBSD') !== -1) os = 'free-bsd'; 
    if (navigator.appVersion.indexOf('Linux') !== -1) os = 'linux'; 
      
    return os;
  }  

  const defaultInstruction = operatingSytem() || 'source';

  function setActiveInstruction (os) {
    $('.instruction').hide();
    $('#' + os).show();
  }

  $('input[name="operating-system"]').on('change', function (event) {
    setActiveInstruction(event.target.value);
  });

  setActiveInstruction(defaultInstruction);
  document.querySelector('.download__os-' + defaultInstruction + ' input').checked = true;
})();