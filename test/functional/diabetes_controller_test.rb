require 'test_helper'

class DiabetesControllerTest < ActionController::TestCase
  test "should get time_series" do
    get :time_series
    assert_response :success
  end

  test "should get heat_map" do
    get :heat_map
    assert_response :success
  end

end
