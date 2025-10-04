import React from 'react';
import { Container, Card } from 'react-bootstrap';

const Dashboard = ({ analysis }) => {
  return (
    <Container>
      <Card>
        <Card.Body>
          <Card.Title>AI Analysis</Card.Title>
          {analysis ? (
            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{analysis}</pre>
          ) : (
            <p>Your personalized weather analysis, precautions, and packing list will appear here once you submit a query.</p>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Dashboard;
