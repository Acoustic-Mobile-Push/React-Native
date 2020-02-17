require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "react-native-acoustic-mobile-push-displayweb"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.description  = <<-DESC
                  react-native-acoustic-mobile-push-displayweb
                   DESC
  s.homepage     = "https://github.com/Acoustic-Mobile-Push/React-Native"
  s.license      = "Copyright Acoustic"
  s.authors      = { "Support" => "support@acoustic.co" }
  s.platforms    = { :ios => "9.0" }
  s.source       = { :git => "https://github.com/Acoustic-Mobile-Push/React-Native.git", :tag => "#{s.version}" }

  s.source_files = "ios/*.{h,m,swift}"
  s.requires_arc = true

  s.dependency "React"
end

