import '../../domain/entities/user_entity.dart';

class UserDto {
  final String id;
  final String email;
  final String name;
  final String? picture;
  final String role;
  final String? bmdcNumber;
  final String? title;
  final bool isGuest;
  final String? token;

  const UserDto({
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

  factory UserDto.fromJson(Map<String, dynamic> json, {String? token}) {
    return UserDto(
      id: json['id']?.toString() ?? 'unknown-id',
      email: json['email']?.toString() ?? '',
      name: json['name']?.toString() ?? 'MedBangla User',
      picture: json['picture']?.toString(),
      role: json['role']?.toString() ?? 'patient',
      bmdcNumber: json['bmdc_number']?.toString(),
      title: json['title']?.toString(),
      isGuest: json['is_guest'] == true,
      token: token ?? json['access_token']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'picture': picture,
      'role': role,
      'bmdc_number': bmdcNumber,
      'title': title,
      'is_guest': isGuest,
      'token': token,
    };
  }

  UserEntity toEntity() {
    return UserEntity(
      id: id,
      email: email,
      name: name,
      picture: picture,
      role: role,
      bmdcNumber: bmdcNumber,
      title: title,
      isGuest: isGuest,
      token: token,
    );
  }
}
