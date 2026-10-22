import 'package:dio/dio.dart';
import '../../../../core/network/api_endpoints.dart';
import '../../../../core/network/dio_client.dart';
import '../models/medicine_dto.dart';
import '../../../../services/medicine_service.dart';

abstract class MedicineRemoteDataSource {
  Future<List<MedicineDto>> searchMedicines(String query, {int limit = 20});
}

class MedicineRemoteDataSourceImpl implements MedicineRemoteDataSource {
  final DioClient client;

  MedicineRemoteDataSourceImpl(this.client);

  @override
  Future<List<MedicineDto>> searchMedicines(
    String query, {
    int limit = 20,
  }) async {
    final cleanQuery = query.trim().toLowerCase();

    try {
      final response = await client.dio.get(
        ApiEndpoints.medicines,
        queryParameters: {
          'q': cleanQuery.isEmpty ? 'Napa' : cleanQuery,
          'limit': limit,
        },
      );

      if (response.statusCode == 200) {
        final results = response.data['results'] as List? ?? [];
        if (results.isNotEmpty) {
          return results.map((m) => MedicineDto.fromJson(m)).toList();
        }
      }
    } on DioException catch (e) {
      // If network fails, gracefully fall back to local curated dataset
      if (e.type == DioExceptionType.connectionError ||
          e.type == DioExceptionType.connectionTimeout) {
        return _fallbackSearch(cleanQuery);
      }
      throw client.handleDioError(e);
    } catch (_) {
      return _fallbackSearch(cleanQuery);
    }

    return _fallbackSearch(cleanQuery);
  }

  List<MedicineDto> _fallbackSearch(String cleanQuery) {
    final list = MedicineService.curatedMedicines;
    final filtered = cleanQuery.isEmpty
        ? list
        : list
              .where(
                (m) =>
                    m.brandName.toLowerCase().contains(cleanQuery) ||
                    m.genericName.toLowerCase().contains(cleanQuery) ||
                    m.manufacturer.toLowerCase().contains(cleanQuery),
              )
              .toList();

    return filtered
        .map(
          (m) => MedicineDto(
            brandId: m.brandId,
            brandName: m.brandName,
            genericName: m.genericName,
            strength: m.strength,
            form: m.form,
            manufacturer: m.manufacturer,
            price: m.price,
            hasBilingualDoc: m.hasBilingualDoc,
            indicationEn: m.indicationEn,
            indicationBn: m.indicationBn,
            sideEffectsEn: m.sideEffectsEn,
            sideEffectsBn: m.sideEffectsBn,
            dosageEn: m.dosageEn,
            dosageBn: m.dosageBn,
            precautionsBn: m.precautionsBn,
          ),
        )
        .toList();
  }
}
