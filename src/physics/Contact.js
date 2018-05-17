const CONTACT_CIRCLE_2_POINT = 1;
const CONTACT_CIRCLE_2_AB_LINE = 2;

// TODO: optimize the structure of Contact and make sure 
// CollisionDetector and ImpluseResolver are using it correctly

class Contact{
  constructor(obj1, obj2){
    this.obj1 = obj1;
    this.obj2 = obj2;
  }

  // contact_point example: {x: 0, y: 0}
  set_point_contact(contact_point){
    this.contact_type = CONTACT_CIRCLE_2_POINT;
    this.contact_point = contact_point;
  }

  // algined_axis example: 'x'
  set_aa_line_contact(aligned_axis){
    this.contact_type = CONTACT_CIRCLE_2_AB_LINE;
    this.aligned_axis = aligned_axis;
  }

  set_penetration(as_vector){
    this.penetration = as_vector;
  }
}

module.exports = Contact;
module.exports.CONTACT_CIRCLE_2_POINT  = CONTACT_CIRCLE_2_POINT;
module.exports.CONTACT_CIRCLE_2_AB_LINE = CONTACT_CIRCLE_2_AB_LINE;
