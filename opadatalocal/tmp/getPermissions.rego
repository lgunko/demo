package permissionsGenerator
import data.permissions

jwt := replace(input.jwt, "Bearer ", "")

jwtDecoded := io.jwt.decode(jwt)
groups := jwtDecoded[1].groups

action := input.action
service := input.service

allowed = true {
    group = groups[_]
    permission = permissions[_]
    permission.service == input.service
    permission.groups[group].permissions[_] == input.action
}