/// <reference types="cypress" />

describe('HTTP Request', () => {
    // Note: GET request is used to retrieve data from a server
    it.only('GET Call', () => {
        cy.request('GET', 'http://localhost:3000/tourist').its('status').should('eq', 200);
    });

    // Note: POST request is used to create a new resource
    it('Post Call', () => {
        cy.request({
            method: 'POST',
            url: 'https://jsonplaceholder.typicode.com/posts/',
            body: {
                title: 'Test post',
                body: 'This is post call',
                userId: 1,
            },
        })
            .its('status')
            .should('eq', 201);
    });

    // Note: PUT request is used to update an existing resource
    it('PUT Call', () => {
        cy.request({
            method: 'PUT',
            url: 'https://jsonplaceholder.typicode.com/posts/1',
            body: {
                title: 'Updated post',
                body: 'This is updated post call',
                userId: 1,
                id: 1,
            },
        })
            .its('status')
            .should('eq', 200);
    });

    // Note: DELETE request is used to delete an existing resource
    it('DELETE Call', () => {
        cy.request({
            method: 'DELETE',
            url: 'https://jsonplaceholder.typicode.com/posts/1',
        })
            .its('status')
            .should('eq', 200);
    });
});
