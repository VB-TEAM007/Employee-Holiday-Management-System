import  { ExtractJwt, Strategy as JwtStrategy} from 'passport-jwt';
import fs from 'fs';
import path from 'path'
import { collections } from './database.js';
import { employeeController } from '../controllers/employee.controller.js';

const pathToKey = path.join(process.cwd(), 'id_rsa_pub.pem');
const PUB_KEY = fs.readFileSync(pathToKey, 'utf8');

const options: any = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: PUB_KEY,
  algorithms: ['RS256'],
};

export function ConfiguratePassport(passport: any){
  passport.use(new JwtStrategy(options, (jwt_payload: any, done: any) => {
      var user;
      console.log(jwt_payload);
      if (process.env.SELECTED_DATABASE === 'mongo') {
        user = collections.employee?.findOne({_id: jwt_payload.sub});
      } else {
        user = employeeController.getById(jwt_payload.sub);
      }
        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      }));              
};