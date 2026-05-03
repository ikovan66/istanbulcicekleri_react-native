// ============================================
// OTA UPDATE API - .NET Core Backend with Dapper + MSSQL
// ============================================
// Bu dosyayı kendi .NET Core projenize ekleyin
// 
// Gerekli NuGet paketleri:
// Install-Package Dapper
// Install-Package Microsoft.Data.SqlClient
// ============================================

using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Dapper;
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace YourNamespace.Controllers
{
    // ============================================
    // MODELS
    // ============================================
    public class OtaBundle
    {
        public int Id { get; set; }
        public string Version { get; set; }
        public string Platform { get; set; }
        public string BundlePath { get; set; }
        public string Hash { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsMandatory { get; set; }
        public string Description { get; set; }
        public bool IsActive { get; set; }
    }

    public class OtaReportRequest
    {
        public string Platform { get; set; }
        public string Version { get; set; }
        public bool Success { get; set; }
        public string ErrorMessage { get; set; }
    }

    // ============================================
    // CONTROLLER
    // ============================================
    [ApiController]
    [Route("api/[controller]")]
    public class OtaController : ControllerBase
    {
        private readonly string _connectionString;
        private readonly string _bundleDirectory = @"E:\siteler_develop\AppOtaBundles";

        public OtaController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("IkostDb");
        }

        /// <summary>
        /// Güncelleme kontrolü
        /// GET /api/ota/check?platform=ios&currentVersion=1.0.0
        /// </summary>
        [HttpGet("check")]
        public async Task<IActionResult> CheckUpdate([FromQuery] string platform, [FromQuery] string currentVersion)
        {
            try
            {
                if (string.IsNullOrEmpty(platform) || string.IsNullOrEmpty(currentVersion))
                {
                    return BadRequest(new { error = "platform and currentVersion are required" });
                }

                using var connection = new SqlConnection(_connectionString);

                var sql = @"
                    SELECT TOP 1 * FROM OtaBundles 
                    WHERE Platform = @Platform AND IsActive = 1 
                    ORDER BY CreatedAt DESC";

                var latestBundle = await connection.QueryFirstOrDefaultAsync<OtaBundle>(sql, new { Platform = platform });

                if (latestBundle == null)
                {
                    return Ok(new { hasUpdate = false });
                }

                // Versiyon karşılaştırması
                var current = new Version(currentVersion);
                var latest = new Version(latestBundle.Version);

                if (latest > current)
                {
                    var bundleUrl = $"{Request.Scheme}://{Request.Host}/api/ota/download/{latestBundle.Version}?platform={platform}";

                    return Ok(new
                    {
                        hasUpdate = true,
                        version = latestBundle.Version,
                        bundleUrl = bundleUrl,
                        isMandatory = latestBundle.IsMandatory,
                        description = latestBundle.Description,
                        hash = latestBundle.Hash
                    });
                }

                return Ok(new { hasUpdate = false });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        /// <summary>
        /// Bundle indirme
        /// GET /api/ota/download/1.0.1?platform=ios
        /// </summary>
        [HttpGet("download/{version}")]
        public async Task<IActionResult> DownloadBundle(string version, [FromQuery] string platform)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);

                var sql = @"
                    SELECT * FROM OtaBundles 
                    WHERE Version = @Version AND Platform = @Platform AND IsActive = 1";

                var bundle = await connection.QueryFirstOrDefaultAsync<OtaBundle>(sql, new { Version = version, Platform = platform });

                if (bundle == null)
                {
                    return NotFound(new { error = "Bundle not found" });
                }

                var filePath = Path.Combine(_bundleDirectory, bundle.BundlePath);

                if (!System.IO.File.Exists(filePath))
                {
                    return NotFound(new { error = "Bundle file not found" });
                }

                var fileStream = new FileStream(filePath, FileMode.Open, FileAccess.Read);
                return File(fileStream, "application/zip", bundle.BundlePath);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        /// <summary>
        /// Güncelleme sonucu raporlama
        /// POST /api/ota/report
        /// </summary>
        [HttpPost("report")]
        public async Task<IActionResult> ReportUpdateStatus([FromBody] OtaReportRequest request)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);

                var sql = @"
                    INSERT INTO OtaReports (Platform, Version, Success, ErrorMessage, ReportedAt) 
                    VALUES (@Platform, @Version, @Success, @ErrorMessage, GETUTCDATE())";

                await connection.ExecuteAsync(sql, request);

                return Ok(new { received = true });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}

// ============================================
// SQL SCRIPT - TABLO OLUŞTURMA
// ============================================
/*
CREATE TABLE OtaBundles (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Version NVARCHAR(50) NOT NULL,
    Platform NVARCHAR(20) NOT NULL,
    BundlePath NVARCHAR(255) NOT NULL,
    Hash NVARCHAR(100),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    IsMandatory BIT NOT NULL DEFAULT 0,
    Description NVARCHAR(500),
    IsActive BIT NOT NULL DEFAULT 1
);

CREATE TABLE OtaReports (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Platform NVARCHAR(20) NOT NULL,
    Version NVARCHAR(50) NOT NULL,
    Success BIT NOT NULL,
    ErrorMessage NVARCHAR(1000),
    ReportedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);
*/
