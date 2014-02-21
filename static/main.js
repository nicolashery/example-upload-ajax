(function() {

  var $form = $('.js-form');
  var $submitAjax = $('.js-submit-ajax');
  var $submitIframe = $('.js-submit-iframe');
  var $message = $('.js-message');
  var $iframeResponse = $('.js-iframe-response');

  function onSubmitAjax(e) {
    if (e) e.preventDefault();
    if (!FormData) {
      return handleError('Sorry! Your browser doesn\'t support FormData');
    }

    disableSubmit();
    postFormAjax(onPostFormSuccess, onPostFormError, onPostFormComplete);
    printMessage('Submitted with ajax...');
  }

  function onSubmitIframe(e) {
    if (e) e.preventDefault();
    disableSubmit();
    $form.submit();
    printMessage('Submitted with iframe...');
  }

  function disableSubmit() {
    $submitAjax.attr('disabled', true);
    $submitAjax.text('Processing...');
    $submitIframe.attr('disabled', true);
    $submitIframe.text('Processing...');
  }

  function enableSubmit() {
    $submitAjax.attr('disabled', false);
    $submitAjax.text('Submit with ajax');
    $submitIframe.attr('disabled', false);
    $submitIframe.text('Submit with iframe');
  }

  function handleSuccess(data) {
    console.log('Success:', data);
    printMessage(data);
  }

  function handleError(data) {
    console.error('Error:', data);
    printMessage(data);
  }

  function printMessage(data) {
    var message = data;
    if (typeof data === 'object') {
      message = JSON.stringify(data, null, 2);
    }
    $message.text(message);
  }

  function getFormDataObject() {
    var formEl = $form[0];
    var formData = new FormData(formEl);
    return formData;
  }

  function postFormAjax(done, fail, always) {
    var formData = getFormDataObject();
    var xhr = $.ajax({
      url: '/api/upload',
      type: 'POST',
      data: formData,
      contentType: false,
      processData: false
    })
    .done(done)
    .fail(fail)
    .always(always);
    return xhr;
  }

  function onIframeResponse() {
    // Expect `this` to be bound to iframe
    var response = parseResponseFromIframe(this);
    onPostFormComplete();
    if (!response.ok) {
      return onPostFormError(response);
    }
    onPostFormSuccess(response);
  }

  function onPostFormComplete(response) {
    enableSubmit();
  }

  function onPostFormSuccess(response) {
    handleSuccess(response);
  }

  function onPostFormError(error) {
    handleError(error);
  }

  function parseResponseFromIframe(iframe) {
    // Inspired by
    // http://cmlenz.github.io/jquery-iframe-transport/
    var doc = iframe.contentWindow ? iframe.contentWindow.document :
      (iframe.contentDocument ? iframe.contentDocument : iframe.document);
    var root = doc.documentElement ? doc.documentElement : doc.body;
    var textarea = root.getElementsByTagName('textarea')[0];

    var response = $(textarea).text();
    try {
      response = JSON.parse(response);
    }
    catch(SyntaxError) {
      response = {response: response};
    }

    return response;
  }

  function bindSubmit() {
    $submitAjax.on('click', onSubmitAjax);
    $submitIframe.on('click', onSubmitIframe);
  }

  function bindIframeResponse() {
    $iframeResponse.on('load', onIframeResponse);
  }

  function bindAllEvents() {
    bindSubmit();
    bindIframeResponse();
  }

  function init() {
    bindAllEvents();
  }

  init();

}());