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
  const defaultRelease = 'release';

  function setActiveInstruction (os) {
    $('.instruction').hide();
    $('#' + os).show();
  }

  function setActiveRelease (release) {
    if (release === 'release') {
      $('.instruction__download-button--playtest').hide();
      $('.instruction__download-button--release').show();
    } else {
      $('.instruction__download-button--playtest').show();
      $('.instruction__download-button--release').hide();
    }
  }

  $('input[name="operating-system"]').on('change', function (event) {
    setActiveInstruction(event.target.value);
  });

  $('input[name="release"]').on('change', function (event) {
    console.log(event.target.value)
    setActiveRelease(event.target.value);
  });

  setActiveInstruction(defaultInstruction);
  setActiveRelease(defaultRelease)
  document.querySelector('.download__os-' + defaultInstruction).checked = true;
})();