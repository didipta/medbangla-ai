class ServerException implements Exception {
  final String message;
  final int? statusCode;
  ServerException(this.message, {this.statusCode});
}

class NetworkException implements Exception {
  final String message;
  NetworkException([this.message = 'Network connection unavailable']);
}

class CacheException implements Exception {
  final String message;
  CacheException([this.message = 'Cache access error']);
}

class UnauthorizedException implements Exception {
  final String message;
  UnauthorizedException([this.message = 'Unauthorized']);
}
