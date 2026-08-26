$log = "D:\work\haven horizen project\myfolder\preview-023cf5c2-57e7-4b91-89e1-47af657a8642.log"
$logErr = "D:\work\haven horizen project\myfolder\preview-023cf5c2-57e7-4b91-89e1-47af657a8642.log.err"
$proc = Start-Process -FilePath 'npm.cmd' -ArgumentList 'run','dev' -WorkingDirectory 'D:\work\haven horizen project' -RedirectStandardOutput $log -RedirectStandardError $logErr -WindowStyle Hidden -PassThru
Write-Output $proc.Id
