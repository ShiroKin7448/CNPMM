import User from '../models/user';

let createNewUser = async (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            await User.create({
                email: data.email,
                password: data.password, // Lưu ý: Cần mã hóa bcrypt giống như bài thực hành trước
                firstName: data.firstName,
                lastName: data.lastName,
                address: data.address,
                phoneNumber: data.phoneNumber,
                gender: data.gender === '1',
                roleId: data.roleId
            });
            resolve('Tạo user thành công');
        } catch (e) {
            reject(e);
        }
    });
}

let getAllUser = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let users = await User.find().lean(); // .lean() giúp trả về object Javascript thuần
            resolve(users);
        } catch (e) {
            reject(e);
        }
    });
}

let getUserInfoById = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await User.findById(userId).lean();
            resolve(user || []);
        } catch (e) {
            reject(e);
        }
    });
}

let updateUser = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            await User.findByIdAndUpdate(data.id, {
                firstName: data.firstName,
                lastName: data.lastName,
                address: data.address
            });
            let allUsers = await User.find().lean();
            resolve(allUsers);
        } catch (e) {
            reject(e);
        }
    });
}

let deleteUserById = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            await User.findByIdAndDelete(userId);
            resolve();
        } catch (e) {
            reject(e);
        }
    });
}

module.exports = {
    createNewUser, getAllUser, getUserInfoById, updateUser, deleteUserById
}