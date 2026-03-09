import React from 'react'
import { Routes , Route } from 'react-router-dom'
import UserDetailComponent from './UserDetail/UserDetailComponent'
import { UserList } from './UserList/UserList'
import { UserComponent } from './UserComponent'
const root = "/admin/users"
const UserRoutes = () => {
  return (
    <Routes>
        <Route element={<UserComponent />}>
            <Route path="edit" element={<UserDetailComponent root={root}/>} />
            <Route path="list" element={<UserList  root={root}/>} />
        </Route>
    </Routes>
  )
}

export default UserRoutes