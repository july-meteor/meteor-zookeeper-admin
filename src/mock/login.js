import { param2Obj } from '@/utils'

const userMap = {
  admin: {
    roles: ['admin'],
    token: 'admin',
    introduction: 'admin',
    avatar: 'http://himg.bdimg.com/sys/portrait/item/43f7e4b883e69c88e28496e6b581e6989f9d13.jpg',
    name: 'Super Admin'
  },
  test: {
    roles: ['test'],
    token: 'test',
    introduction: '游客',
    avatar: 'http://himg.bdimg.com/sys/portrait/item/43f7e4b883e69c88e28496e6b581e6989f9d13.jpg',
    name: 'Normal Editor'
  }
}

export default {
  loginByUsername: config => {

    const { username,password } = JSON.parse(config.body)
    if (username == 'admin'){
      if (password !=  'helloworld'){
        return
      }
    }
    console.log(username)
    return userMap[username]

  },
  getUserInfo: config => {
    const { token } = param2Obj(config.url)
    if (userMap[token]) {
      return userMap[token]
    } else {
      return false
    }
  },
  logout: () => 'success'
}
