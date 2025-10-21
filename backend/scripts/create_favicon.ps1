param(
    [string]$OutputPath = "c:\Users\sebas\OneDrive\Desktop\Code\aboelo-fitness2\aboelo-fitness\frontend\public\favicon.ico"
)
Add-Type -AssemblyName System.Drawing
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public static class IconHelpers
{
    [DllImport("user32.dll", CharSet = CharSet.Auto)]
    public extern static bool DestroyIcon(IntPtr handle);
}
"@
$size = 256
$bitmap = New-Object System.Drawing.Bitmap($size, $size)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$primary = [System.Drawing.Color]::FromArgb(0x2d,0x7d,0x7d)
$accent = [System.Drawing.Color]::FromArgb(0x3f,0xa3,0xa3)
$graphics.Clear($primary)
$margin = [int]($size * 0.18)
$diameter = $size - (2 * $margin)
$accentBrush = New-Object System.Drawing.SolidBrush($accent)
$graphics.FillEllipse($accentBrush, $margin, $margin, $diameter, $diameter)
$accentBrush.Dispose()
$fontSize = [float]($size * 0.52)
$font = New-Object System.Drawing.Font("Segoe UI", $fontSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$rect = New-Object System.Drawing.RectangleF(0, 0, $size, $size)
$format = New-Object System.Drawing.StringFormat
$format.Alignment = [System.Drawing.StringAlignment]::Center
$format.LineAlignment = [System.Drawing.StringAlignment]::Center
$graphics.DrawString("A", $font, [System.Drawing.Brushes]::White, $rect, $format)
$graphics.Dispose()
$iconHandle = $bitmap.GetHicon()
try {
    $icon = [System.Drawing.Icon]::FromHandle($iconHandle)
    $stream = [System.IO.File]::Open($OutputPath, [System.IO.FileMode]::Create)
    try {
        $icon.Save($stream)
    } finally {
        $stream.Dispose()
        $icon.Dispose()
    }
} finally {
    [IconHelpers]::DestroyIcon($iconHandle) | Out-Null
    $bitmap.Dispose()
}
