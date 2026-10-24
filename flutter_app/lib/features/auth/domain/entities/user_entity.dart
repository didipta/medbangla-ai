import 'package:equatable/equatable.dart';

class UserEntity extends Equatable {
  final String id;
  final String email;
  final String name;
  final String? picture;
  final String role; // 'patient' or 'doctor'
  final String? bmdcNumber;
  final String? title;
  final bool isGuest;
  final String? token;

  const UserEntity({
    required this.id,
    required this.email,
    required this.name,
    this.picture,
    required this.role,
    this.bmdcNumber,
    this.title,
    this.isGuest = false,
    this.token,
  });

  bool get isDoctor => role.toLowerCase() == 'doctor';
  bool get isPatient => !isDoctor;
  bool get isDemo {
    if (isGuest) return false;
    final lowerId = id.toLowerCase();
    final lowerEmail = email.toLowerCase();
    final lowerName = name.toLowerCase();
    final tokenVal = token?.toLowerCase() ?? '';
    return lowerId.startsWith('demo-') ||
        tokenVal.startsWith('demo-') ||
        lowerEmail.contains('demo') ||
        lowerEmail == 'mahdi.hasan@gmail.com' ||
        lowerEmail == 'dr.fazlul.hoque@gmail.com' ||
        lowerName.contains('demo') ||
        name.contains('Mahdi Hasan') ||
        name.contains('Fazlul Hoque');
  }

  static const guest = UserEntity(
    id: 'guest',
    email: 'guest@medbangla.ai',
    name: 'অতিথি ব্যবহারকারী (Guest)',
    role: 'patient',
    isGuest: true,
  );

  @override
  List<Object?> get props => [
    id,
    email,
    name,
    picture,
    role,
    bmdcNumber,
    title,
    isGuest,
    token,
  ];
}
