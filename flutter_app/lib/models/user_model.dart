class UserModel {
  final String id;
  final String name;
  final String email;
  final String role; // 'patient', 'doctor', 'admin', 'guest'
  final String? picture;
  final String? bmdcNumber;
  final String? title;
  final String token;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.picture,
    this.bmdcNumber,
    this.title,
    required this.token,
  });

  bool get isDoctor => role == 'doctor';
  bool get isAdmin => role == 'admin';
  bool get isGuest => role == 'guest';

  factory UserModel.guest() {
    return UserModel(
      id: 'guest-user-01',
      name: 'অতিথি ব্যবহারকারী (Guest)',
      email: 'guest@medbangla.ai',
      role: 'guest',
      picture: 'https://api.dicebear.com/7.x/avataaars/png?seed=Guest',
      token: 'demo-patient-token',
    );
  }

  factory UserModel.demoPatient() {
    return UserModel(
      id: 'demo-user-patient-01',
      name: 'মাহদী হাসান (Demo Patient)',
      email: 'mahdi.hasan@gmail.com',
      role: 'patient',
      picture: 'https://api.dicebear.com/7.x/avataaars/png?seed=Mahdi',
      token: 'demo-patient-token',
    );
  }

  factory UserModel.demoDoctor() {
    return UserModel(
      id: 'demo-user-doctor-01',
      name: 'Prof. Dr. Md. Fazlul Hoque',
      email: 'dr.fazlul.hoque@gmail.com',
      role: 'doctor',
      picture: 'https://api.dicebear.com/7.x/avataaars/png?seed=Fazlul',
      bmdcNumber: 'BMDC-A-42190',
      title: 'Nephrology & Medicine Specialist',
      token: 'demo-doctor-token',
    );
  }
}
