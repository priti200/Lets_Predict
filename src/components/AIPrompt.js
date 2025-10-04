import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, InputGroup } from 'react-bootstrap';

// A simple microphone icon component
const MicIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-mic-fill" viewBox="0 0 16 16">
        <path d="M5 3a3 3 0 0 1 6 0v5a3 3 0 0 1-6 0V3z"/>
        <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z"/>
    </svg>
);

const AIPrompt = ({ onSubmit }) => {
  const [place, setPlace] = useState('');
  const [date, setDate] = useState('');
  const [plans, setPlans] = useState('');

  const handleVoiceInput = (setter) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Sorry, your browser does not support speech recognition.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setter(transcript);
    };
    recognition.start();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ place, date, plans });
  };

  return (
    <Container className="my-3">
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="formPlace">
          <Form.Label>Place</Form.Label>
          <InputGroup>
            <Form.Control type="text" placeholder="e.g., Yosemite National Park" value={place} onChange={(e) => setPlace(e.target.value)} />
            <Button variant="outline-secondary" onClick={() => handleVoiceInput(setPlace)}><MicIcon /></Button>
          </InputGroup>
        </Form.Group>

        <Form.Group className="mb-3" controlId="formDate">
          <Form.Label>Date</Form.Label>
          <InputGroup>
            <Form.Control type="text" placeholder="e.g., July 15-20" value={date} onChange={(e) => setDate(e.target.value)} />
            <Button variant="outline-secondary" onClick={() => handleVoiceInput(setDate)}><MicIcon /></Button>
          </InputGroup>
        </Form.Group>

        <Form.Group className="mb-3" controlId="formPlans">
          <Form.Label>Plans</Form.Label>
          <InputGroup>
            <Form.Control type="text" placeholder="e.g., Hiking and camping" value={plans} onChange={(e) => setPlans(e.target.value)} />
            <Button variant="outline-secondary" onClick={() => handleVoiceInput(setPlans)}><MicIcon /></Button>
          </InputGroup>
        </Form.Group>

        <Button variant="primary" type="submit">Get AI Analysis</Button>
      </Form>
    </Container>
  );
};

export default AIPrompt;
