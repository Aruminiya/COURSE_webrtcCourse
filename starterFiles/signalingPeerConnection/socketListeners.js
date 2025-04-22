// on connection get all available offers and call createOfferEls
socket.on('availableOffers', (offers) => {
  console.log('availableOffers', offers);
  createOfferEls(offers);
})

// someone just made a new offer and we're already here - call createOfferEls
socket.on('newOfferAwaiting', (offers) => {
  console.log('newOfferAwaiting', offers);
  createOfferEls(offers);
})

socket.on('answerResponse', (offer) => {
  console.log('answerResponse', offer);
  addAnswer(offer);
});

socket.on('receivedIceCandidateFromServer', (iceCandidate) => {
  addNewIceCandidate(iceCandidate);
  console.log('iceCandidate', iceCandidate);
});

function createOfferEls(offers) {
  // make green answer button for this new offer
  const answerEl = document.querySelector('#answer');
  offers.forEach(o => {
    console.log('createOfferEls', o);
    const newOfferEl = document.createElement('div');
    newOfferEl.innerHTML = `
      <button class="btn btn-success col-1">
        Answer ${o.offererUserName}
      </button>
    `;
    newOfferEl.addEventListener('click', () => answerOffer(o));
    answerEl.appendChild(newOfferEl);
  })
  // add event listener to accept button
}