import jsonwebtoken from 'jsonwebtoken';
import { isFunctionExpression } from 'typescript';

export function isAuth (req: any, res: any, next: any) {
  if (req.cookies.access_token) {
    next();
  } else {
    res.status(401).json({ msg: 'You are not authorized to view this resource' });
  }
}

export function isUnauth (req: any, res: any, next: any) {
  if (!req.cookies.access_token) {
    next();
  } else {
    res.status(401).json({ msg: 'You are havent access to view this resource' });
  }
}

export function getIdfromJwt(token: string){
  const [, accessToken] = token.split(' ');
  const decodedJwt = jsonwebtoken.decode(accessToken);
  return decodedJwt!.sub;
}