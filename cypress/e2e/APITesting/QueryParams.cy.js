describe('API Testing', () => {
    // Simpan query parameter dalam variable agar mudah digunakan ulang
    const queryParam = {
        page: 2,
    };

    it('Passing Query Parameters', () => {
        // Mengirim request GET ke endpoint users dengan query parameter
        cy.request({
            method: 'GET',
            url: 'https://reqres.in/api/users',
            qs: queryParam, // query parameter page=2
        }).then((response) => {
            // Memastikan status code response adalah 200 (sukses)
            expect(response.status).to.eq(200);

            // Memastikan field 'page' dalam body sesuai query yang kita kirim (page=2)
            expect(response.body.page).to.eq(2);

            // Memastikan jumlah data user yang dikembalikan adalah 6
            expect(response.body.data).to.have.length(6);

            // Memastikan object user pertama memiliki id=7
            expect(response.body.data[0]).to.have.property('id', 7);

            // Memastikan object user pertama memiliki first_name='Michael'
            expect(response.body.data[0]).to.have.property('first_name', 'Michael');
        });
    });
});
