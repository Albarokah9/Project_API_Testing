describe('api testing', () => {
    it('Approach1 - Hard coding json object', () => {
        const requestBody = {
            tourist_name: 'Jhon Doe',
            tourist_email: 'Jhond123456@gmail.com',
            tourist_location: 'UK',
        };

        cy.request({
            method: 'POST',
            url: 'http://localhost:3000/Tourist',
            body: requestBody,
        }).then((response) => {
            // assert response status code
            expect(response.status).to.eq(201);
            // assert response body name
            expect(response.body.tourist_name).to.eq('Jhon Doe');
            // assert response body email
            expect(response.body.tourist_email).to.eq('Jhond123456@gmail.com');
            // assert response body location
            expect(response.body.tourist_location).to.eq('UK');
        });
    });
    it('Approach2 - Dynamically generating json object', () => {
        const requestBody = {
            tourist_name: Math.random().toString(5).substring(2),
            tourist_email: Math.random().toString(5).substring(2) + '@gmail.com',
            tourist_location: 'UK',
        };

        cy.request({
            method: 'POST',
            url: 'http://localhost:3000/Tourist',
            body: requestBody,
        }).then((response) => {
            // assert response status code status
            expect(response.status).to.eq(201);
            // assert response body name
            expect(response.body.tourist_name).to.eq(requestBody.tourist_name);
            // assert response body email
            expect(response.body.tourist_email).to.eq(requestBody.tourist_email);
            // assert response body location
            expect(response.body.tourist_location).to.eq(requestBody.tourist_location);
        });
    });

    it.only('Approach3 - Using fixture file', () => {
        cy.fixture('tourist').then((data) => {
            const requestBody = data;

            cy.request({
                method: 'POST',
                url: 'http://localhost:3000/Tourist',
                body: requestBody,
            }).then((response) => {
                expect(response.status).to.eq(201);
                expect(response.body.tourist_name).to.eq(requestBody.tourist_name);
                expect(response.body.tourist_email).to.eq(requestBody.tourist_email);
                expect(response.body.tourist_location).to.eq(requestBody.tourist_location);

                // assert using has.property
                expect(response.body).has.property('tourist_email', requestBody.tourist_email);
                // assert using to.have.property
                expect(response.body).to.have.property('tourist_email', requestBody.tourist_email);
            });
        });
    });
});
