param(
    [string]$OutputDirectory = "..\public"
)

Add-Type -AssemblyName System.Drawing

$primaryColor = [System.Drawing.ColorTranslator]::FromHtml('#2d7d7d')
$accentColor = [System.Drawing.ColorTranslator]::FromHtml('#ff8a65')
$centerColor = [System.Drawing.ColorTranslator]::FromHtml('#1f5f5f')

function New-AppIcon {
    param(
        [int]$Size,
        [string]$Path
    )

    $bitmap = New-Object System.Drawing.Bitmap $Size, $Size
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.Clear($primaryColor)

    $margin = [int]($Size * 0.12)
    $outerSize = $Size - (2 * $margin)
    $rect = New-Object System.Drawing.Rectangle $margin, $margin, $outerSize, $outerSize
    $penWidth = [int]($Size * 0.06)
    $pen = New-Object System.Drawing.Pen $accentColor, $penWidth
    $graphics.DrawEllipse($pen, $rect)

    $innerSize = [int]($Size * 0.45)
    $innerRect = New-Object System.Drawing.Rectangle (($Size - $innerSize) / 2), (($Size - $innerSize) / 2), $innerSize, $innerSize
    $graphics.FillEllipse([System.Drawing.Brushes]::White, $innerRect)

    $centerSize = [int]($Size * 0.22)
    $centerRect = New-Object System.Drawing.Rectangle (($Size - $centerSize) / 2), (($Size - $centerSize) / 2), $centerSize, $centerSize
    $centerBrush = New-Object System.Drawing.SolidBrush $centerColor
    $graphics.FillEllipse($centerBrush, $centerRect)

    $graphics.Dispose()
    $pen.Dispose()
    $centerBrush.Dispose()
    $bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    $bitmap.Dispose()
}

$fullOutput = Resolve-Path $OutputDirectory
New-AppIcon -Size 512 -Path (Join-Path $fullOutput 'logo512.png')
New-AppIcon -Size 256 -Path (Join-Path $fullOutput 'logo256.png')
New-AppIcon -Size 192 -Path (Join-Path $fullOutput 'logo192.png')
