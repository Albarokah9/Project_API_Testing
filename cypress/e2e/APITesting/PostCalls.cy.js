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
            expect(response.status).to.eq(201);
            expect(response.body.tourist_name).to.eq('Jhon Doe');
            expect(response.body.tourist_email).to.eq('Jhond123456@gmail.com');
            expect(response.body.tourist_location).to.eq('UK');
        });
    });

    it('Approach2 - Dynamically generating json object', () => {
        const randomName = Math.random().toString().substring(2, 7);
        const requestBody = {
            tourist_name: randomName,
            tourist_email: `${randomName}@gmail.com`,
            tourist_location: 'UK',
        };

        cy.request({
            method: 'POST',
            url: 'http://localhost:3000/Tourist',
            body: requestBody,
        }).then((response) => {
            expect(response.status).to.eq(201);
            expect(response.body.tourist_name).to.eq(requestBody.tourist_name);
            expect(response.body.tourist_email).to.eq(requestBody.tourist_email);
            expect(response.body.tourist_location).to.eq(requestBody.tourist_location);
            expect(response.body).to.have.property('createdAt');
            expect(response.body).to.have.property('updatedAt');
            expect(response.body).to.have.property('id');
        });
    });
});
