export type ResponseSignUpType = {
    user: SignUpUserType
}

export type SignUpUserType = {
    id: number,
    email: string,
    name: string,
    lastName: string
}