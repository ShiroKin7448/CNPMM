import CRUDService from '../services/CRUDService';

let getHomePage = (req, res) => {
    return res.render('homepage.ejs');
}

let getCRUD = (req, res) => {
    return res.render('crud.ejs');
}

let postCRUD = async (req, res) => {
    let message = await CRUDService.createNewUser(req.body);
    console.log(message);
    // Sau khi thêm mới thành công, chuyển hướng về trang danh sách
    return res.redirect('/get-crud');
}

let getFindAllCrud = async (req, res) => {
    let data = await CRUDService.getAllUser();
    return res.render('users/findAllUser.ejs', {
        datalist: data
    });
}

let getEditCRUD = async (req, res) => {
    let userId = req.query.id;
    if (userId) {
        let userData = await CRUDService.getUserInfoById(userId);
        return res.render('users/editUser.ejs', {
            data: userData
        });
    } else {
        return res.send('Không tìm thấy ID người dùng!');
    }
}

let putCRUD = async (req, res) => {
    let data = req.body;
    let allUsers = await CRUDService.updateUser(data);
    return res.render('users/findAllUser.ejs', {
        datalist: allUsers
    });
}

let deleteCRUD = async (req, res) => {
    let id = req.query.id;
    if (id) {
        await CRUDService.deleteUserById(id);
        // Xóa xong chuyển hướng lại về trang danh sách
        return res.redirect('/get-crud');
    } else {
        return res.send('Không tìm thấy người dùng để xóa');
    }
}

// Bắt buộc phải export tất cả các hàm ở đây thì bên web.js mới hiểu được
module.exports = {
    getHomePage,
    getCRUD,
    postCRUD,
    getFindAllCrud,
    getEditCRUD,
    putCRUD,
    deleteCRUD
}