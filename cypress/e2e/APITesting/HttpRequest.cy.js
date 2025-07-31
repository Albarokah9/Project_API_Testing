/// <reference types="cypress" />

describe('HTTP Request', () => {
    // Note: GET request is used to retrieve data from a server
    it('GET Call', () => {
        cy.request('GET', 'http://localhost:3000/tourist').its('status').should('eq', 200);
    });

    // Note: POST request is used to create a new resource
    it('Post Call', () => {
        cy.request({
            method: 'POST',
            url: 'http://localhost:3000/tourist',
            body: {
                tourist_name: 'John Doe',
                tourist_email: 'john.doe@gmail.com',
                tourist_location: 'UK',
            },
        })
            .its('status')
            .should('eq', 201);
    });

    // Note: PUT request is used to update an existing resource
    it('PATCH Call', () => {
        cy.request({
            method: 'PATCH',
            url: 'http://localhost:3000/tourist/11',
            body: {
                tourist_location: 'Kota Baru',
            },
        })
            .its('status')
            .should('eq', 200);
    });

    it('PUT Call', () => {
        cy.request({
            method: 'PUT',
            url: 'http://localhost:3000/tourist/10',
            body: {
                tourist_name: 'Amelia',
                tourist_email: 'amelia@gmail.com',
                tourist_location: 'Semarang',
            },
        })
            .its('status')
            .should('eq', 200);
    });

    // Note: DELETE request is used to delete an existing resource
    it('DELETE Call', () => {
        cy.request({
            method: 'DELETE',
            url: 'http://localhost:3000/tourist/12',
        })
            .its('status')
            .should('eq', 200);
    });
});
